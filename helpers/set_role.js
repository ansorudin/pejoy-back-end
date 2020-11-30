function setRole (email){
    let role
    if(email==='yudistia.firman@gmail.com'){
        role='admin'
    }else{
        role='customer'
    }

    return role
}


module.exports= setRole