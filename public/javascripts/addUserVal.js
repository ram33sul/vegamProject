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
            label.innerHTML='Full Name (required)';
            label.style.color='rgb(256,100,100)';
        }
        else if(input.length<4){
            label.innerHTML='Full Name (Must have atleast 4 letters)';
            label.style.color='rgb(256,100,100)';
        }
        else if(input.length>30){
            label.innerHTML="Full Name (Can't have more than 30 letters)";
            label.style.color='rgb(256,100,100)';
        }
        else{
            label.innerHTML="Full Name";
            label.style.color='lightgreen';
            count++;
        }
    }
    else if(id==1){
        if(input.length==0){
            label.innerHTML='Username (required)';
            label.style.color='rgb(256,100,100)';
        }
        else if(input.length<4){
            label.innerHTML='Username (Must have atleast 4 characters)';
            label.style.color='rgb(256,100,100)';
        }
        else if(input.length>20){
            label.innerHTML="Username (Can't have more than 20 letters)";
            label.style.color='rgb(256,100,100)';
        }
        else{
            label.innerHTML="Username";
            label.style.color='lightgreen';
            count++;
        }
    }
    else if(id==2){
        let emailFormat = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if(input.length==0){
            label.innerHTML='Email (required)';
            label.style.color='rgb(256,100,100)';
        }
        else if(emailFormat.test(input)){
            label.innerHTML='Email';
            label.style.color='lightgreen';
            count++;
        }
        else{
            label.innerHTML='Email (Enter a valid email)';
            label.style.color='rgb(256,100,100)';
        }
    }
    else if(id==3){
        if(input.length!=10){
            label.innerHTML='Mobile Number (Must be 10 digits)';
            label.style.color='rgb(256,100,100)';
        }
        else{
            label.innerHTML="Mobile Number";
            label.style.color='lightgreen';
            count++;
        }
    }
    else if(id==4){
        if(input.length<6){
            label.innerHTML='Password (Must have atleast 6 characters)';
            label.style.color='rgb(256,100,100)';
        }
        else{
            label.innerHTML='Password';
            label.style.color='lightgreen';
            count++;
        }
    }
    else if(id==5){
        let password=document.getElementsByClassName('section_1_2_2_1')[id-1].value;
        if(password.length<6){
            label.innerHTML="Confirm Password";
            label.style.color='white';
        }
        else if(input!=password){
            label.innerHTML="Confirm Password (Password doesn't match)";
            label.style.color='rgb(256,100,100)';
        }
        else{
            label.innerHTML="Confirm Password";
            label.style.color='lightgreen';
            count++;
        }
    }
    return count;
}

function validateInput(event,id){
    let input=document.getElementsByClassName('section_1_2_2_1')[id].value;
    let label=document.getElementsByClassName('section_1_2_2_2')[id];
    var k = event.key;
    k = k.codePointAt(0);
    if(id==0){
        if(k!=32&&k<65&&k!=8&&k!=16&&k!=17&&k!=18&&k!=20){
            label.innerHTML="Full Name (Entered letter is not valid)";
            label.style.color='rgb(256,100,100)';
            return false;
        }
        else if(k>122){
            label.innerHTML="Full Name (Entered letter is not valid)";
            label.style.color='rgb(256,100,100)';
            return false;
        }
        else if(k>90&&k<97){
            label.innerHTML="Full Name (Entered letter is not valid)";
            label.style.color='rgb(256,100,100)';
            return false;
        }
        else{
            label.innerHTML="Full Name";
            label.style.color='black';
        }
        if(input.lastIndexOf(" ")==input.length-1){
            if (k == 32) {
                label.innerHTML="Full Name (Can't add double spaceß)";
                label.style.color='rgb(256,100,100)';
                return false;
            }
        }
    }
    else if(id==1){
        if(k==32){
            label.innerHTML='Username (Space is not allowed)';
            label.style.color='rgb(256,100,100)';
            return false;
        }
        else if(k!=8&&k<48){
            label.innerHTML='Username (Entered letter is not valid)';
            label.style.color='rgb(256,100,100)';
            return false;
        }
        else if(k>57&&k<65){
            label.innerHTML='Username (Entered letter is not valid)';
            label.style.color='rgb(256,100,100)';
            return false;
        }
        else if(k>90&&k<97){
            label.innerHTML='Username (Entered letter is not valid)';
            label.style.color='rgb(256,100,100)';
            return false;
        }
        else if(k>122&&k!=127){
            label.innerHTML='Username (Entered letter is not valid)';
            label.style.color='rgb(256,100,100)';
            return false;
        }
        else{
            label.innerHTML='Username';
            label.style.color='black';
        }
    }
    else if(id==2){
        label.innerHTML="Email";
        label.style.color='white';
    }
    else if(id==3){
        if(k!=8&&k<48){
            label.innerHTML='Mobile Number (Entered letter is not valid)';
            label.style.color='rgb(256,100,100)';
            return false;
        }
        else if(k>57&&k!=66){
            label.innerHTML='Mobile Number (Entered letter is not valid)';
            label.style.color='rgb(256,100,100)';
            return false;
        }
        else{
            label.innerHTML='Mobile Number';
            label.style.color='black';
        }
    }
    else if(id==4){
        if(k==32){
            label.innerHTML='Password (Space is not allowed)';
            label.style.color='rgb(256,100,100)';
            return false;
        }
        else{
            label.innerHTML='Password';
            label.style.color='black';
        }
    }
    else if(id==5){
        if(k==32){
            label.innerHTML='Confirm Password (Space is not allowed)';
            label.style.color='rgb(256,100,100)';
            return false;
        }
        else{
            label.innerHTML='Confirm Password';
            label.style.color='black';
        }
    }
}

function validateSubmit(){
    count=0;
    for(let i=0;i<6;i++){
        count = inputBlur(i);
    }
    if(count==6){
        return true;
    }
    else{
        return false;
    }
}