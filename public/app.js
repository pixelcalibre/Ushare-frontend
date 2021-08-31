const dropBody= document.querySelector(".drop-body");
const browseBtn=document.querySelector(".browse-btn");
const browse = document.querySelector("#browse");
const host = "https://innshare.heroku.com/";
//this si to upload the file URL
const uploadURL= `${host}api/files`;
const emailURL= `${host}api/files/send`;


const progressBar=document.querySelector(".progress-bar");
const progressPercent=document.querySelector("#percent");
const progressBody=document.querySelector(".progress-body")
const fileURL=document.querySelector("#fileURL");
const shareBody=document.querySelector('.share-body');
const copyIcon = document.querySelector("#copy-icon");
const emailForm =document.querySelector("#email-form");
const toastAlert = document.querySelector(".toast-alert");
const maxSize=100*1024*1024;
dropBody.addEventListener("dragover",(e)=>{
    e.preventDefault();
    if(!dropBody.classList.contains("ondrag")){
        dropBody.classList.add("ondrag");
    }
});

dropBody.addEventListener("dragleave",()=>{
    dropBody.classList.remove("ondrag");
});
dropBody.addEventListener("drop",(e)=>{
    e.preventDefault();
    dropBody.classList.remove("ondrag");
    const files=e.dataTransfer.files; //this is to get the files that is being dropped on the drop body
    //if files is >0 then we're sending it to the browse that is input
    if(files.length){
    browse.files=files;
    toUploadFile();
    }

});
//to upload files when browse is clicked
browse.addEventListener("change", () => {
    toUploadFile();
})

browseBtn.addEventListener("click", ()=>{
    browse.click();
});
copyIcon.addEventListener("click",() =>{
    fileURL.select();  
    document.execCommand("copy");
    showToastAlert("Link Copied");
})

//top upload files to the URL
const toUploadFile = () => {
    
    if(browse.files.length >1){
        resetBrowseValue();
        showToastAlert("Upload one file at a time");
        return;
    }
    const file=browse.files[0]; 
    if(file.size >  maxSize)
    {
        showToastAlert("Size of the file should be less than 100MB");
        resetBrowseValue();
        return;
    }
    progressBody.style.display = "block";
    
    const formData = new FormData();
    formData.append("myfile",file);


    const xhr= new XMLHttpRequest();
    //we get the state of the event
    xhr.onreadystatechange = function () {
    if (xhr.readyState == XMLHttpRequest.DONE) {
      onSuccessfulUpload(xhr.responseText);
    }
  };
    xhr.upload.onprogress = updateProgress;
   xhr.upload.onerror = ()=> {
    resetBrowseValue();
    showToastAlert(`Error in upload : ${xhr.statusText}`);
}

    xhr.open("POST", uploadURL);
    xhr.send(formData);
};

const resetBrowseValue =()=>{
    browse.value="";
}
const updateProgress = (e) => {
    let percentage =Math.round ((e.loaded)/(e.total));
    percentage*=100;
    console.log(percentage);
    progressBar.style.width = `${percentage}%`
    progressPercent.innerText=percentage;
}

const onSuccessfulUpload = ({file:url}) => {
console.log(url);
browse.value=""
emailForm[2].removeAttribute("disabled");
progressBody.style.display="none";
shareBody.style.display="block";
fileURL.value=url;
};

emailForm.addEventListener("submit", (e)=>{
    e.preventDefault();
    const url =fileURL.value;
    const formData= {
        uuid:url.split("/").splice(-1,1)[0],
        emailTo:emailForm.elements["to-email"].value,
        emailFrom:emailForm.elements["from-email"].value,
    };
    emailForm[2].setAttribute("disabled","true");// to remove the send button once pressed on send
    fetch(emailURL,{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify(formData),
    }).then(res=>res.json())
    .then(({success})=> {
        if(success){
            sharingContainer.styler.display="none";
            showToastAlert("Email sent");
        };
    });
});

let alertTimer;
const showToastAlert = (msg) =>{
    toastAlert.innerText=msg;
    toastAlert.style.transform="translate(-50%,0)";
    clearTimeout(alertTimer)
    alertTimer=setTimeout(()=>{
        toastAlert.style.transform="translate(-50%,60px)";
    },2000);
}