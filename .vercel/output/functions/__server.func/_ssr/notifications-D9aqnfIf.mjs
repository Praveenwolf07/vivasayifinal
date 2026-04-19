import { c as createSsrRpc } from "./createSsrRpc-Co2YOj5i.mjs";
import { c as createServerFn } from "./index.mjs";
const sendNotification = createServerFn({
  method: "POST"
}).inputValidator((d) => d).handler(createSsrRpc("320362c93d5296d57f55bcbc9275bfdc521d27e864738f8f25ce53d911c6500e"));
export {
  sendNotification as s
};
