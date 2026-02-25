import axios from "axios";


interface AuthRequestType{
    accessToken?: string,
    url:String,
    data?: any,
}

interface PostRequestType extends AuthRequestType{
    data: any
}

interface ResponseType{
    success:Function,
    failure:Function
}

class Backend{

    async Get(data:AuthRequestType, responseData:ResponseType){
        try{
            let config:any= {
                method: 'get',
                maxBodyLength: Infinity,
                url: data.url,
                headers: { 
                    ...(data.accessToken ? {'Authorization': `Bearer ${data.accessToken}`}:{})
                },
                body: JSON.stringify(data?.data != null ? data?.data : {})
            };
            const response =  await axios.request(config);
            responseData.success(response.data.data);
        }catch(e:any){
            responseData.failure(e)
            return {
                status : false
            }
        }
    }

    async Post(data:PostRequestType, responseData:ResponseType){
        try{
            let config:any= {
                method: 'post',
                maxBodyLength: Infinity,
                url: data.url,
                headers: { 
                    'Content-Type': 'application/json',
                    ...(data.accessToken ? {'Authorization': `Bearer ${data.accessToken}`}:{}),
                },
                data: JSON.stringify(data.data)
            };

            const response =  await axios.request(config);
            responseData.success(response.data.data);
        }catch(e:any){
            // console.log(e);
            responseData.failure(e)
        }
    }

    async Patch(data:PostRequestType, responseData:ResponseType){
        try{
            let config:any= {
                method: 'patch',
                maxBodyLength: Infinity,
                url: data.url,
                headers: { 
                    'Content-Type': 'application/json',
                    ...(data.accessToken ? {'Authorization': `Bearer ${data.accessToken}`}:{}),
                },
                data: JSON.stringify(data.data)
            };

            const response =  await axios.request(config);
            responseData.success(response.data.data);
        }catch(e:any){
            // console.log(e);
            responseData.failure(e)
        }
    }

    async Put(data:PostRequestType, responseData:ResponseType){
        try{
            let config:any= {
                method: 'put',
                maxBodyLength: Infinity,
                url: data.url,
                headers: { 
                    'Content-Type': 'application/json',
                    ...(data.accessToken ? {'Authorization': `Bearer ${data.accessToken}`}:{}),
                },
                data: JSON.stringify(data.data)
            };

            const response =  await axios.request(config);
            responseData.success(response.data.data);
        }catch(e:any){
            // console.log(e);
            responseData.failure(e)
        }
    }

    async Delete(data:PostRequestType, responseData:ResponseType){
        try{
            let config:any= {
                method: 'delete',
                maxBodyLength: Infinity,
                url: data.url,
                headers: { 
                    'Content-Type': 'application/json',
                    ...(data.accessToken ? {'Authorization': `Bearer ${data.accessToken}`}:{}),
                },
                data: JSON.stringify(data.data)
            };

            const response =  await axios.request(config);
            responseData.success(response.data.data);
        }catch(e:any){
            // console.log(e);
            responseData.failure(e)
        }
    }

    async Form(data:PostRequestType, responseData:ResponseType){
        try{
            let config:any= {
                method: 'post',
                maxBodyLength: Infinity,
                url: data.url,
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    ...(data.accessToken ? {'Authorization': `Bearer ${data.accessToken}`}:{}),
                },
                data: data.data
            };

            const response =  await axios.request(config);
            
            responseData.success(response.data);
        }catch(e:any){
            console.log(e);
            responseData.failure(e)
        }
    }
}

export const BackendService = new Backend();