"use client";

import styles from "./page.module.css";
import axios from "axios";
import { useState, useEffect } from "react";
import xml2js from "xml2js"; // Import xml2js

const PEXELS_API_KEY =
  "6iTp30E3mFVwO2nc34X1dnwhbmOa0o7cO1G7rdKo2JAX9A235m62cSkW"; // Replace with your Pexels API key

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("machine learning");
  const [papers, setPapers] = useState([]);
  const [videos, setVideos] = useState([]);
  const [videoUrl, setVideoUrl] = useState(null); // State for video URL
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPapers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://export.arxiv.org/api/query", {
        params: {
          search_query: `all:${searchQuery}`,
          start: 0,
          max_results: 5,
        },
      });

      // Convert XML to JavaScript object
      xml2js.parseString(response.data, async (err, result) => {
        if (err) {
          console.error("Failed to parse XML:", err);
          setError("Failed to parse response");
          setLoading(false);
          return;
        }

        // Log the parsed result to check the structure
        console.log("Parsed API Response:", result);

        // Access entries in the parsed result
        const entries = result.feed?.entry || [];
        setPapers(entries);

        // Prepare text for Pexels API
        const text = entries.map((paper) => paper.title[0]).join(" ");
        console.log("Query for Pexels API:", text); // Log the query

        await fetchVideosFromPexels(text);

        setLoading(false);
      });
    } catch (error) {
      console.error("Failed to fetch papers:", error);
      setError("Failed to fetch papers");
      setLoading(false);
    }
  };

  const fetchVideosFromPexels = async (query) => {
    setLoading(true);
    setError(null);
    try {
      const encodedQuery = encodeURIComponent(query); // Encode the query string
      const response = await axios.get("https://api.pexels.com/videos/search", {
        params: {
          query: encodedQuery,
          per_page: 5,
        },
        headers: {
          Authorization: PEXELS_API_KEY,
        },
      });

      // Log the response to check the structure
      console.log("Pexels API Response:", response.data);

      // Access videos in the response
      const videoResults = response.data.videos || [];
      setVideos(videoResults);

      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch videos from Pexels:", error);
      setError("Failed to fetch videos from Pexels");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, [searchQuery]);

  return (
    <main className={styles.main}>
      <div>
        <h1>Scientific Papers and Related Videos</h1>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for papers"
        />
        <button onClick={fetchPapers}>Search</button>
        {loading && <p>Loading...</p>}
        {error && <p>{error}</p>}
        <h2>Papers</h2>
        <ul>
          {papers.length ? (
            papers.map((paper, index) => (
              <li key={index}>
                <a href={paper.id[0]} target="_blank" rel="noopener noreferrer">
                  {paper.title[0] || "No title available"}
                </a>
                <p>{paper.summary[0] || "No summary available"}</p>
              </li>
            ))
          ) : (
            <p>No papers found.</p>
          )}
        </ul>
        <h2>Videos from Pexels</h2>
        <ul>
          {videos.length ? (
            videos.map((video, index) => (
              <li key={index}>
                <a href={video.url} target="_blank" rel="noopener noreferrer">
                  {video.title || "No title available"}
                </a>
                {video.video_files && video.video_files.length > 0 && (
                  <video src={video.video_files[0].link} controls width="600" />
                )}
              </li>
            ))
          ) : (
            <p>No videos found.</p>
          )}
        </ul>
      </div>
    </main>
  );
}
