var app = new Vue({
  el: '.app',
  data: {
    base_file: 'https://s3-us-west-2.amazonaws.com/akeshavan-mindcontrol/mindcontrol_freesurfer/sub86665-sub86665-000-MPRAGE__t1.nii.gz?dl=1',
    mask_file: 'https://s3-us-west-2.amazonaws.com/akeshavan-mindcontrol/mindcontrol_freesurfer/sub86665-sub86665-000-MPRAGE__segmentation.nii.gz?dl=1',
    slice_direction: 'ax',
    mask_threshold: 10000,
    request: '',
    data: [],
    log: [],
    status: true,
    error: false,
    url: 'https://ec2-54-218-37-252.us-west-2.compute.amazonaws.com:8443/function/test_download21',
  },
  methods: {
    submitForm: function(){
      this.status = false
      console.log(this.base_file, this.mask_file, this.slice_direction)
      this.request = JSON.stringify({
        base_file: this.base_file,
        mask_file: this.mask_file,
        mask_threshold: parseInt(this.mask_threshold),
        slice_direction: this.slice_direction,
      })
      console.log(this.request)
      this.runFunction();
      // this.sendData();
    },
// Request URL:https://ec2-54-218-37-252.us-west-2.compute.amazonaws.com:8443/function/test_download21


    runFunction: function() {
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": this.url,
        "method": "POST",
        "headers": {
          "Authorization": "Basic YW5pc2hhOmdvbGRpZTEyMw=="
        },
        "data": this.request,
        "error": function(){
          this.error = true;
        }
      }
      var self = this;
      console.log("sending AJAX request")
      $.ajax(settings).done(function (response) {
        var data = JSON.parse(response)
        self.data = data.data;
        self.log = data.log;
        self.status = true;
      })
    },
    
    sendData: function() {
      console.log("url is", this.url);
      axios.post({
        url: this.url,
        method: 'POST',
        headers: {
          "Authorization": "Basic YW5pc2hhOmdvbGRpZTEyMw=="
        },
        data: this.request,
        processData: false,
        crossDomain: true,
      }).then(function(data){
          var data = JSON.parse(response)
          self.data = data.data;
          self.log = data.log;
        }).catch(function(e){
          this.error = true;
          console.log(e)
      })
    }
    
  },
})
