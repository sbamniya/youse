import axios from "axios";
import { env } from "../config/env";

const instance = axios.create({
  baseURL: "https://www.fast2sms.com/dev/bulkV2",
  headers: {
    Authorization: `Bearer ${env.FAST2SMS_API_KEY}`,
  },
});

const sendSMS = async (data: {
  /**
   * The recipient's phone number.
   * if you want to send to multiple users, pass an array of phone numbers.
   */
  to: string | string[];
  /**
   * The message to be sent.
   */
  message: string;
}) => {
  return instance.post("/", {
    numbers: Array.isArray(data.to)
      ? data.to
          .map((phone) => phone.trim())
          .filter(Boolean)
          .join(",")
      : data.to.trim(),
    message: data.message,
    route: 'q'
  });
};

export default sendSMS;
