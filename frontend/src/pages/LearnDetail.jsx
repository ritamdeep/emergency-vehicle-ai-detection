import React from 'react';
import { useRouter } from '../context/RouterContext';
import LearnPage from '../components/common/LearnPage';

/**
 * LearnDetail Page (/learn/:featureId)
 * 
 * Extracts the featureId from the route path and renders the LearnPage template.
 */
export default function LearnDetail() {
  const { currentPath } = useRouter();

  // Extract featureId from path like "/learn/system-status"
  const match = currentPath.match(/^\/learn\/([^/?#]+)/);
  const topicId = match ? match[1] : null;

  return <LearnPage topicId={topicId} />;
}
