"use client";
import React from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

const Skeleton: React.FC<SkeletonProps> = ({ 
  width = "100%", 
  height = "20px", 
  borderRadius = "8px",
  className = "",
  style = {}
}) => {
  return (
    <div
      className={`loading-shimmer ${className}`}
      style={{
        width,
        height,
        borderRadius,
        ...style
      }}
    />
  );
};

export const ArticleCardSkeleton: React.FC = () => (
  <div className="result-card" style={{ padding: 24 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 24, marginBottom: 18 }}>
      <Skeleton width="70%" height="24px" />
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <Skeleton width="80px" height="32px" borderRadius="16px" />
        <Skeleton width="100px" height="36px" borderRadius="8px" />
      </div>
    </div>
    <Skeleton width="100%" height="16px" style={{ marginBottom: 8 }} />
    <Skeleton width="85%" height="16px" style={{ marginBottom: 8 }} />
    <Skeleton width="60%" height="16px" style={{ marginBottom: 20 }} />
    <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
      <Skeleton width="120px" height="40px" borderRadius="8px" />
      <Skeleton width="80px" height="40px" borderRadius="8px" />
      <Skeleton width="100px" height="40px" borderRadius="8px" />
    </div>
  </div>
);

export const SearchBarSkeleton: React.FC = () => (
  <div className="glass-card" style={{ padding: "48px 24px", marginBottom: 40 }}>
    <div style={{ textAlign: "center", marginBottom: 32 }}>
      <Skeleton width="400px" height="48px" style={{ margin: "0 auto 16px" }} />
      <Skeleton width="300px" height="20px" style={{ margin: "0 auto 32px" }} />
      <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
        <Skeleton width="100%" height="56px" borderRadius="12px" />
        <Skeleton width="140px" height="56px" borderRadius="12px" />
      </div>
    </div>
  </div>
);

export const AnalyticsCardSkeleton: React.FC = () => (
  <div className="glass-card" style={{ padding: 24 }}>
    <Skeleton width="200px" height="24px" style={{ marginBottom: 16 }} />
    <Skeleton width="100%" height="200px" borderRadius="12px" style={{ marginBottom: 16 }} />
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <Skeleton width="60px" height="24px" borderRadius="12px" />
      <Skeleton width="80px" height="24px" borderRadius="12px" />
      <Skeleton width="70px" height="24px" borderRadius="12px" />
    </div>
  </div>
);

export const KnowledgeGraphSkeleton: React.FC = () => (
  <div className="glass-card" style={{ padding: 24, height: "500px" }}>
    <Skeleton width="100%" height="100%" borderRadius="12px" />
  </div>
);

export default Skeleton;
