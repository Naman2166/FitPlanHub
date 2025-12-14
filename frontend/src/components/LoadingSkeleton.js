import React from 'react';
import './LoadingSkeleton.css';

export const PlanCardSkeleton = () => {
  return (
    <div className="skeleton-card">
      <div className="skeleton skeleton-title"></div>
      <div className="skeleton skeleton-text"></div>
      <div className="skeleton skeleton-text short"></div>
      <div className="skeleton skeleton-button"></div>
    </div>
  );
};

export const TableRowSkeleton = () => {
  return (
    <tr className="skeleton-row">
      <td><div className="skeleton skeleton-text"></div></td>
      <td><div className="skeleton skeleton-text"></div></td>
      <td><div className="skeleton skeleton-text short"></div></td>
      <td><div className="skeleton skeleton-text short"></div></td>
      <td><div className="skeleton skeleton-button"></div></td>
    </tr>
  );
};

export const ProfileSkeleton = () => {
  return (
    <div className="skeleton-profile">
      <div className="skeleton skeleton-avatar"></div>
      <div className="skeleton skeleton-title"></div>
      <div className="skeleton skeleton-text"></div>
    </div>
  );
};

export default PlanCardSkeleton;
