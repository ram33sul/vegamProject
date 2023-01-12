function inputClick(id){
    document.getElementsByClassName('section_1_2_2_2')[id].style.opacity='1';
    document.getElementsByClassName('section_1_2_2_2')[id].style.fontSize='14px';
    document.getElementsByClassName('section_1_2_2_2')[id].style.top='-20px';
    document.getElementsByClassName('section_1_2_2_2')[id].style.fontWeight='bold';
}
let count;
function inputBlur(id){
    let input=document.getElementsByClassName('section_1_2_2_1')[id].value;
    let label=document.getElementsByClassName('section_1_2_2_2')[id];
    if(id==0){
        if(input.length==0){
            label.innerHTML='Outlet Name (required)';
            label.style.color='rgb(256,0,0)';
        }
        else if(input.length<2){
            label.innerHTML='Outlet Name (Must have atleast 2 letters)';
            label.style.color='rgb(256,0,0)';
        }
        else if(input.length>50){
            label.innerHTML="Outlet Name (Can't have more than 17 letters)";
            label.style.color='rgb(256,0,0)';
        }
        else{
            label.innerHTML="Outlet Name";
            label.style.color='green';
            count++;
        }
    }
    else if(id==1){
        if(input.length==0){
            label.innerHTML='Outlet Registration Number (required)';
            label.style.color='rgb(256,0,0)';
        }
        else{
            label.innerHTML="Outlet Registration Number";
            label.style.color='green';
            count++;
        }
    }
    else if(id==2){
        if(input.length==0){
            label.innerHTML='GST Number (required)';
            label.style.color='rgb(256,0,0)';
        }
        else{
            label.innerHTML="GST Number";
            label.style.color='green';
            count++;
        }
    }
    else if(id==3){
        let emailFormat = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if(input.length==0){
            label.innerHTML='Email (required)';
            label.style.color='rgb(256,0,0)';
        }
        else if(emailFormat.test(input)){
            label.innerHTML='Email';
            label.style.color='green';
            count++;
        }
        else{
            label.innerHTML='Email (Enter a valid email)';
            label.style.color='rgb(256,0,0)';
        }
    }
    else if(id==4){
        let gpsFormat = /^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/;
        if(input.length==0){
            label.innerHTML='GPS Coordinates (required)';
            label.style.color='rgb(256,0,0)';
        }
        else if(gpsFormat.test(input)){
            label.innerHTML="GPS Coordinates Number";
            label.style.color='green';
            count++;
        }
        else{
            label.innerHTML='GPS Coordinates (Entered value is not valid)';
            label.style.color='rgb(256,0,0)';
        }
    }
    else if(id==5){
        if(input.length<6){
            label.innerHTML='Password (Must have atleast 6 characters)';
            label.style.color='rgb(256,0,0)';
        }
        else{
            label.innerHTML='Password';
            label.style.color='green';
            count++;
        }
    }
    else if(id==6){
        let password=document.getElementsByClassName('section_1_2_2_1')[id-1].value;
        if(password.length<6){
            label.innerHTML="Confirm Password";
            label.style.color='white';
        }
        else if(input!=password){
            label.innerHTML="Confirm Password (Password doesn't match)";
            label.style.color='rgb(256,0,0)';
        }
        else{
            label.innerHTML="Confirm Password";
            label.style.color='green';
            count++;
        }
    }
    return count;
}

function validateInput(event,id){
    let input=document.getElementsByClassName('section_1_2_2_1')[id].value;
    let label=document.getElementsByClassName('section_1_2_2_2')[id];
    var k = event ? event.which : window.event.keyCode;
    if(id==0){
        if(k!=32&&k<48&&k!=8&&k!=16&&k!=17&&k!=18&&k!=20){
            label.innerHTML="Outlet Name (Entered letter is not valid)";
            label.style.color='rgb(256,0,0)';
            return false;
        }
        else if(k>57&&k<65){
            label.innerHTML="Outlet Name (Entered letter is not valid)";
            label.style.color='rgb(256,0,0)';
            return false;
        }
        else if(k>122){
            label.innerHTML="Outlet Name (Entered letter is not valid)";
            label.style.color='rgb(256,0,0)';
            return false;
        }
        else if(k>90&&k<97){
            label.innerHTML="Outlet Name (Entered letter is not valid)";
            label.style.color='rgb(256,0,0)';
            return false;
        }
        else{
            label.innerHTML="Outlet Name";
            label.style.color='white';
        }
        if(input.lastIndexOf(" ")==input.length-1){
            if (k == 32) {
                label.innerHTML="Outlet Name (Can't add double spaceß)";
                label.style.color='rgb(256,0,0)';
                return false;
            }
        }
    }
    else if(id==1){
        if(k!=8&&k<48){
            label.innerHTML='Outlet Registration Number (Entered letter is not valid)';
            label.style.color='rgb(256,0,0)';
            return false;
        }
        else if(k>57){
            label.innerHTML='Outlet Registration Number (Entered letter is not valid)';
            label.style.color='rgb(256,0,0)';
            return false;
        }
        else{
            label.innerHTML='Outlet Registration Number';
            label.style.color='white';
        }
    }
    else if(id==2){
        if(k==32){
            label.innerHTML='GST Number (Space is not allowed)';
            label.style.color='rgb(256,0,0)';
            return false;
        }
        else if(k!=8&&k<48){
            label.innerHTML='GST Number (Entered letter is not valid)';
            label.style.color='rgb(256,0,0)';
            return false;
        }
        else if(k>57&&k<65){
            label.innerHTML='GST Number (Entered letter is not valid)';
            label.style.color='rgb(256,0,0)';
            return false;
        }
        else if(k>90&&k<97){
            label.innerHTML='GST Number (Entered letter is not valid)';
            label.style.color='rgb(256,0,0)';
            return false;
        }
        else if(k>122){
            label.innerHTML='GST Number (Entered letter is not valid)';
            label.style.color='rgb(256,0,0)';
            return false;
        }
        else{
            label.innerHTML='GST Number';
            label.style.color='white';
        }
    }
    else if(id==3){
        label.innerHTML="Email";
        label.style.color='white';
    }
    else if(id==4){
        label.innerHTML="GPS Coordinates";
        label.style.color='white';
    }
    else if(id==5){
        if(k==32){
            label.innerHTML='Password (Space is not allowed)';
            label.style.color='rgb(256,0,0)';
            return false;
        }
        else{
            label.innerHTML='Password';
            label.style.color='white';
        }
    }
    else if(id==6){
        if(k==32){
            label.innerHTML='Confirm Password (Space is not allowed)';
            label.style.color='rgb(256,0,0)';
            return false;
        }
        else{
            label.innerHTML='Confirm Password';
            label.style.color='white';
        }
    }
}

function validateSubmit(){
    count=0;
    for(let i=0;i<7;i++){
        count = inputBlur(i);
    }
    if(count==7){
        return true;
    }
    else{
        return false;
    }
}