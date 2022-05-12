import axios, { AxiosRequestConfig } from "axios";
import { useState } from "react";
import SingleLevelSelector from "./SingleLevelSelector";
import "./styles.css";

export default function App() {
  const fetchData = (config: AxiosRequestConfig<any> | undefined) => {
    return axios.get("https://api.instantwebtools.net/v1/passenger", config);
  };

  return (
    <div className="App">
      <SingleLevelSelector fetchData={fetchData} />
    </div>
  );
}
