import axios from "axios";
import server from "../environment";

const getMeetingSummary = async (transcript) => {
  const response = await axios.post(`${server}/api/v1/ai/summary`, {
    transcript,
  });

  return response.data;
};

export default getMeetingSummary;
