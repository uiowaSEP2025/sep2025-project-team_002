// OrgPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function OrgPage() {
  const { slug } = useParams();
  const [orgData, setOrgData] = useState(null);

  useEffect(() => {
    // 可从后端 API 拉组织信息（后期加上）
    // 这里只是简单显示
    setOrgData({ name: slug.toUpperCase() });
  }, [slug]);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Welcome to {orgData?.name} Organization Page 🎓</h1>
      <p>We're glad you're here!</p>
    </div>
  );
}

export default OrgPage;