## *`$> npm i --save llama.native.js@1.0.0`*

A solution to host a socket-io server that handles inference with models in your filesystem.

### **Requirements**

1. > Compile / Build / Make `llama.cpp` for your os and place the file relative to this directory.

    I would rather you build this yourself, as its not hard and only the end result matters.

    If i could license llama.cpp i could include both binary executable files.

2. > You need a ggml type model that runs on most devices

    you can find 7B or 13B ggml models on huggingface, *I might wanna reccomend someone* who is quick to rebuild the new models into ggml. **ggml models can run on the cpu**, so can work on any host machine. the file extension is `.bin` and *you can download and clone huggingface repo's*

    because huggingface deems all files to be Git LFS (in other word HUGE files) and therefor most models cannot be uploaded to github, even then again im not able to upload more then a simple 7B parameter model, which is why there is no included llama / alpaca ggml models