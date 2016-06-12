// Copyright (c) 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// This function is called by common.js when the NaCl module is
// loaded.
function moduleDidLoad() {
  // Once we load, hide the plugin. In this example, we don't display anything
  // in the plugin, so it is fine to hide it.
  common.hideModule();

  // After the NaCl module has loaded, common.naclModule is a reference to the
  // NaCl module's <embed> element.
  //
  // postMessage sends a message to it.
  common.naclModule.postMessage({cmd: 'greeting', data: 'hello'});
  document.querySelector('input[type="file"]').addEventListener('change',function(){
        console.log(this.files);
        var file_list = this.files;
        var file = file_list[0];
        var reader = new FileReader();
        reader.onload = function(){
            window.file_result = reader.result;
            common.naclModule.postMessage({cmd: 'open image', data: reader.result});
        }
        reader.readAsArrayBuffer(file);
  });
}
var returns = [];
function draw(data, ctx){
    imdata = new ImageData(new Uint8ClampedArray(data.data), data.width, data.height);
    ctx.putImageData(imdata, 0, 0);
}

// This function is called by common.js when a message is received from the
// NaCl module.
function handleMessage(message) {
    console.log(message.data);
    if (message.data.error){
        console.log(message.data.error);
    }else{
        var data = message.data;
        if(data.height && data.width && data.data){
            var ctx = document.querySelector('canvas').getContext('2d');
            draw(data, ctx);
        }
    }
    returns.push(message.data);    
}
