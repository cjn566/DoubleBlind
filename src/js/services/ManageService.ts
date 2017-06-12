
module.exports = function($http, $log) {
    let getStudies = ()=>{
        return $http.get('/studies').then((response)=>{
            return response.data
        }, (err)=>{
            // Do Something with the error
        })
    }

    let getStudy = (id:number) => {
        $log.log("getting: " + id);
        return $http.get('/getStudy',
                {
                    'params': {'id': id}
                }
            ).then((response)=>{
                $log.log(response);
                return response.data
            }, (err)=>{
                $log.error(err);
            })
    };

    let saveStudy = (study:Object) => {
        $log.log("saving study...");
        return $http.post('/saveStudy',study)
            .then((response)=>{
                $log.log("saved: ");
                $log.log(response);
                return response.data
            }, (err)=>{
                $log.error(err);
            })
    }

    return{
        "getStudies": getStudies,
        "getStudy": getStudy,
        "saveStudy": saveStudy,
    }
}