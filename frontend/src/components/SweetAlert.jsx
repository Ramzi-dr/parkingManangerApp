import Swal from "sweetalert2";
import "./sweetAlert.css"
const SweetAlert = (position, title, callBack) => {
    const alertStyle = {
        popup: 'alert-popup',
        title: 'alert-title',
        content: 'alert-content',
        confirmButton:'alert-confirm-button'
        
    }
    const infoStyle = {
        popup: 'info-popup',
        title: 'info-title',
        content: 'info-content',
        confirmButton:'info-confirm-button'
    }
    return Swal.fire({
        icon: position === 'alert' ? 'error' : 'info',
        title: title,      
        showCloseButton: false, // Hide the close button
        confirmButtonText: 'OK',
        customClass: position === 'alert' ? alertStyle : infoStyle
    }).then((result)=>{
        if(result.isConfirmed){
            if(callBack && typeof callBack ==='function'){
                callBack()
            }
        }
    })
}
export default SweetAlert