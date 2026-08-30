import axios from "axios";

const getMeetingSummary = async (transcript) => {
  const response = await axios.post("http://localhost:8000/api/v1/ai/summary", {
    transcript,
  });

  return response.data;
};

export default getMeetingSummary;
