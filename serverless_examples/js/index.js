var app = new Vue({
  el: '.app',
  data: {
    base_file: 'https://firebasestorage.googleapis.com/v0/b/my-test-project-aa983.appspot.com/o/base000.nii.gz?alt=media&token=7f296b88-3696-42c0-bfff-5a7c92ce91ce',
    mask_file: 'https://firebasestorage.googleapis.com/v0/b/my-test-project-aa983.appspot.com/o/mask000.nii.gz?alt=media&token=c80845a4-dcef-4a94-a87e-e74b18d9642b',
    slice_direction: 'ax',
    mask_threshold: 100,
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