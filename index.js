const core = require('@actions/core');
const axios = require('axios');

try{
    const workSpaceName = core.getInput('workSpaceName');
    const organizationName = core.getInput('organizationName');
    const token = core.getInput('terraformToken');
    const terraformHost = core.getInput('terraformHost');
    const isDestroy = core.getInput('isDestroy');
    const message = core.getInput('message');

    const options = {
      headers: {'Content-Type': 'application/vnd.api+json',
                'Authorization': 'Bearer '+token
              }       
    };

    // Fetching WorkSpaceId
    const terraformWorkSpaceEndpoint = "https://"+terraformHost+"/api/v2/organizations/"+organizationName+"/workspaces";
    const res = await this.axios.get(terraformWorkSpaceEndpoint);
    if(!res.data.data.id){
      core.setFailed("WorkSpace "+workSpaceName+" Not Found!");
    }
    const workSpaceId = res.data.data.id;
    console.log("workSpaceId:"+workSpaceId)

    
    const terraformRunEndpoint = "https://"+terraformHost+"/api/v2/runs";

    let request = { data : { 
                    attributes: { "is-destroy" : isDestroy, "message" : message },
                    type: "runs",
                    relationships: {
                      workspace: {
                        data: {
                          type: "workspaces",
                          id: workSpaceId
                        }
                      }
                    }
                   }};
    console.log("request:" + JSON.stringify(request));
   
   // Invoking Terraform Run API
    axios.post(terraformRunEndpoint, request, options)
      .then((response) => {
        console.log("success:"+ JSON.stringify(response.data));
        core.setOutput("runId", response.data.data.id);
      }, (error) => {
        console.error("error:"+JSON.stringify(error.response.data));
        core.setFailed(error.message);
      });

} catch(error){
    core.setFailed(error.message);
}