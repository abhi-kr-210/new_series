class ApiError extends Error{
    constructor(statusCode,message="Not Found",erros=[],stack=""){
             super(message);
             this.statusCode=statusCode;
             this.erros=erros;
             this.data=null;
             this.success=false;
             this.message=message;
    }
}

export {ApiError};