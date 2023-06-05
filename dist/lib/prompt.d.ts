import stream from "stream";
declare const codexPrompt: (inference_prompt: string, inference_context: string, inference_type: string, inference_lang: string, data_callback: CallableFunction) => Promise<stream.Readable>;
export default codexPrompt;
//# sourceMappingURL=prompt.d.ts.map