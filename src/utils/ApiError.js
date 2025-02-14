class ApiError extends Error{
    constructor(statusCode,message="Not Found",errors=[],stack=""){
             super(message);
             this.statusCode=statusCode;
             this.errors=errors;
             this.data=null;
             this.success=false;
             this.message=message;
    }
}

export {ApiError};