## *`npm i --save llama.native.js@1.0.0`*

A solution to host a socket-io server that handles inference with models in your filesystem. based on llama.cpp

### **Requirements**

1. > Compile / Build / Make `llama.cpp` for your os and place the file relative to this directory.

    I would rather you build this yourself, as its not hard and only the end result matters.

    If i could license llama.cpp i could include both binary executable files.

2. > You need a ggml type model that runs on most devices

    you can find 7B or 13B ggml models on huggingface, *I might wanna reccomend someone* who is quick to rebuild the new models into ggml. **ggml models can run on the cpu**, so can work on any host machine. the file extension is `.bin` and *you can download and clone huggingface repo's*

    because huggingface deems all files to be Git LFS (in other word HUGE files) and therefor most models cannot be uploaded to github, even then again im not able to upload more then a simple 7B parameter model, which is why there is no included llama / alpaca ggml models

**Thanks to**: [TheBloke](https://patreon.com/TheBlokeAI?utm_medium=clipboard_copy&utm_source=copyLink&utm_campaign=creatorshare_fan&utm_content=join_link) **on patreon**,
*I have been dependend on his quantizations and huggingface repos. providing realtime conversion of many different types of llm's like the llama model and all iterations we use today. he provides a way for developers that dont have funds to generate these models or transform them live with frequently updated repositories for all the billions of parameters available.*