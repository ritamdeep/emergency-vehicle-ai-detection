/**
 * Learn Guide Content Catalog
 * 
 * Central data source for the /learn overview and /learn/[feature] detail pages.
 * Follows a standardized educational template:
 * - What it is
 * - Why it matters
 * - How it works
 * - How to read it (with an example)
 * - Related features
 */

export const LEARN_TOPICS = [
  {
    id: 'system-status',
    title: 'System Status',
    category: 'Core System',
    summary: 'The single health indicator showing if the intersection controller is online and operational.',
    whatItIs: 'A real-time health indicator showing whether the intelligent traffic controller, computer vision pipeline, and physical signal scheduler are connected and actively managing the junction.',
    whyItMatters: 'In municipal traffic infrastructure, operators need an immediate, foolproof signal that the autonomous preemption system is running and that safety fail-safes are active before emergency vehicles arrive.',
    howItWorks: [
      { step: 1, title: 'Health Ping', desc: 'The frontend periodically queries the backend /health endpoint.' },
      { step: 2, title: 'State Validation', desc: 'The controller verifies that the YOLO neural model weights are resident in memory and video decoding drivers are ready.' },
      { step: 3, title: 'Telemetry Broadcast', desc: 'If any anomaly occurs, the system defaults to standard fail-safe timed cycling.' }
    ],
    howToRead: 'A green dot with "Normal" means standard timed signal cycling is active and safe. A pulsing red dot with "Ambulance active" means an emergency corridor is actively held green.',
    relatedFeatures: ['ai-detection', 'emergency-mode', 'traffic-signals']
  },
  {
    id: 'ai-detection',
    title: 'AI Detection Engine',
    category: 'Computer Vision',
    summary: 'Ultralytics YOLOv11 deep neural network trained to detect ambulances and emergency vehicles.',
    whatItIs: 'A specialized computer vision detector built on Ultralytics YOLOv11 Nano. It processes video streams frame by frame to identify emergency response vehicles in complex traffic scenes.',
    whyItMatters: 'Traditional acoustic sirens and radio transponders fail in dense urban noise or cross-border municipal jurisdictions. Visual recognition works directly from existing municipal CCTV cameras with zero vehicle modifications.',
    howItWorks: [
      { step: 1, title: 'Frame Subsampling', desc: 'Incoming 30 FPS video is sampled at every 3rd frame to process 10 keyframes per second with minimal latency.' },
      { step: 2, title: 'Neural Inference', desc: 'Frames are normalized to 640×640 pixels and passed through the fine-tuned 2.58M-parameter YOLOv11 checkpoint.' },
      { step: 3, title: 'Bounding Box Extraction', desc: 'Vehicle candidates are located with coordinates and class probability scores.' }
    ],
    howToRead: 'If the model detects an ambulance with confidence above the 20% sensitivity threshold, the frame is marked positive and passed to the strobe scanner.',
    relatedFeatures: ['confidence-score', 'cctv-lane-feeds', 'video-upload']
  },
  {
    id: 'emergency-mode',
    title: 'Emergency Priority Mode',
    category: 'Signal Control',
    summary: 'Autonomous priority override that grants an immediate green wave and automatically recovers.',
    whatItIs: 'An autonomous priority override protocol that immediately interrupts regular round-robin traffic lights when an ambulance is verified in any inbound approach lane, holding green until the vehicle clears and automatically returning to normal cycling.',
    whyItMatters: 'Every minute saved during critical medical emergencies or fires increases survival rates by 7% to 10%. Crucially, automated recovery ensures emergency overrides never get stuck, preventing long junction gridlocks without requiring human dispatcher intervention.',
    howItWorks: [
      { step: 1, title: 'Edge-Triggered Activation', desc: 'When video playback enters an active ambulance segment or an instant trigger fires, the approach corridor is preempted.' },
      { step: 2, title: 'Instant Green & Cross-Traffic Red', desc: 'The target road signal is forced to Green (held countdown), while all conflicting cross-traffic directions are locked at Red.' },
      { step: 3, title: 'Inactivity Grace Period', desc: 'When the ambulance exits the camera view, a 1.5-second grace window absorbs brief detection occlusions before initiating clearance.' },
      { step: 4, title: 'Clearance Buffer & Auto-Recovery', desc: 'A 3.0-second safety clearance buffer safely drains the junction before returning to standard round-robin rotation.' }
    ],
    howToRead: 'When active, the top banner turns red, the junction displays a pulsing beacon, and the active signal shows a held countdown. The status transitions automatically back to "Normal" 3 seconds after the ambulance departs.',
    relatedFeatures: ['signal-priority-logic', 'traffic-signals', 'emergency-event-summary']
  },
  {
    id: 'demo-mode',
    title: 'Demo Mode & Test Harness',
    category: 'Testing & Tools',
    summary: 'Interactive simulation drawer to test signal preemption across any lane without a backend.',
    whatItIs: 'A built-in interactive test harness allowing students, evaluators, and traffic engineers to test the full preemption workflow on any lane (Lanes 1 to 8) without needing heavy GPU hardware or video uploads.',
    whyItMatters: 'Enables instant demonstration of system capabilities, presentation dry-runs, and rapid edge-case verification during development or offline deployment.',
    howItWorks: [
      { step: 1, title: 'Drawer Activation', desc: 'Click "Demo Mode" in the top bar to open the testing drawer.' },
      { step: 2, title: 'Select Approach Lane', desc: 'Click any lane button (e.g. "Lane 5 • Road 3 South").' },
      { step: 3, title: 'State Machine Execution', desc: 'The controller immediately fires the preemption state machine as if a live camera detected an ambulance.' }
    ],
    howToRead: 'Toggle Demo Mode on or off using the top bar button. The side drawer lets you trigger simulated emergency vehicles on demand and return to normal cycling with one click.',
    relatedFeatures: ['emergency-mode', 'junction-diagram', 'cctv-lane-feeds']
  },
  {
    id: 'junction-diagram',
    title: '4-Way Junction Diagram',
    category: 'Visualization',
    summary: 'Top-down graphical layout of the 4-road, 8-lane intersection with live signal states.',
    whatItIs: 'An architectural top-down visualizer modeling a major 4-way intersection (North, East, South, West) with 8 inbound approach lanes, pedestrian zebra crossings, and 4 dedicated physical signals.',
    whyItMatters: 'Provides operators with intuitive situational awareness of the physical crossroads, showing which lanes have moving traffic, where vehicles are waiting, and which corridor is granted priority.',
    howItWorks: [
      { step: 1, title: 'Roadway Mapping', desc: 'Road 1 (North), Road 2 (East), Road 3 (South), and Road 4 (West) each host 2 inbound lanes.' },
      { step: 2, title: 'Signal Linkage', desc: 'Each road is governed by a traffic signal positioned ahead of the stop line.' },
      { step: 3, title: 'Corridor Highlights', desc: 'When an ambulance approaches, the active corridor glows with laser guidance lines.' }
    ],
    howToRead: 'Green lights indicate roads with right-of-way. Red lights indicate stopped cross-traffic. Pulsing red lanes indicate approaching emergency vehicles.',
    relatedFeatures: ['traffic-signals', 'cctv-lane-feeds', 'signal-priority-logic']
  },
  {
    id: 'traffic-signals',
    title: 'Traffic Signals & Lamps',
    category: 'Hardware',
    summary: 'Physical 3-lamp signal displays with digital countdown timers and LED hoods.',
    whatItIs: 'High-contrast visual representations of standard municipal 3-lamp traffic signals (Red, Amber, Green) equipped with real-time digital countdown readouts.',
    whyItMatters: 'Drivers depend on standardized color conventions and predictable countdowns. The interface mirrors real-world physical signal heads with realistic Fresnel lenses and visor hoods.',
    howItWorks: [
      { step: 1, title: 'Red Lamp (Stop)', desc: 'Held whenever cross-traffic or emergency preemption requires the road to halt.' },
      { step: 2, title: 'Yellow Lamp (Clearance)', desc: 'Displays for 3.0 seconds during phase transitions so vehicles can safely stop.' },
      { step: 3, title: 'Green Lamp (Go)', desc: 'Displays for 10.0 seconds in normal cycle or remains held during emergency preemption.' }
    ],
    howToRead: 'Each signal card displays the road name, lamp status, and remaining seconds. In priority mode, the active signal is highlighted with a green priority ring.',
    relatedFeatures: ['junction-diagram', 'signal-priority-logic', 'emergency-mode']
  },
  {
    id: 'signal-priority-logic',
    title: 'Signal Priority & Preemption Logic',
    category: 'Signal Control',
    summary: 'Deterministic state machine governing transitions, multi-lane handovers, and safe recovery.',
    whatItIs: 'The algorithmic state machine that balances fair round-robin traffic flow during normal periods against deterministic safety overrides when emergency vehicles are sighted across one or more approach lanes.',
    whyItMatters: 'Uncontrolled overrides could cause intersection gridlock or catastrophic t-bone collisions. The state machine strictly guarantees conflicting red holds, seamless multi-lane handovers, and safe anti-starvation rotation.',
    howItWorks: [
      { step: 1, title: 'Round-Robin Rotation', desc: 'Normal mode rotates sequentially: Road 1 (North) → Road 2 (East) → Road 3 (South) → Road 4 (West).' },
      { step: 2, title: 'Preemption Intercept', desc: 'Upon detection, normal timers pause immediately and the priority road takes precedence without cycling through yellow.' },
      { step: 3, title: 'Multi-Lane Handover', desc: 'If a second ambulance arrives on a different road during an active emergency, the controller smoothly hands over priority to the new road.' },
      { step: 4, title: 'Clearance Buffer Cancellation', desc: 'If an ambulance reappears during the 3-second clearance buffer, clearance is immediately cancelled and green is maintained.' },
      { step: 5, title: 'Sequential Resumption', desc: 'When all emergencies clear, normal cycle resumes on the NEXT sequential road rather than resetting to Road 1, preventing starvation.' }
    ],
    howToRead: 'During normal operations, watch the countdown timer cycle smoothly. When an emergency is triggered, notice the immediate switch to the priority road and the intelligent sequential resumption once cleared.',
    relatedFeatures: ['emergency-mode', 'traffic-signals', 'detection-timeline']
  },
  {
    id: 'cctv-lane-feeds',
    title: 'CCTV Lane Feeds & Cameras',
    category: 'Surveillance',
    summary: '8 surveillance channels monitoring each inbound lane for incoming vehicles.',
    whatItIs: 'A multi-channel surveillance matrix where each tile corresponds to a dedicated CCTV camera mounted over one of the 8 inbound traffic lanes.',
    whyItMatters: 'By monitoring individual lanes rather than a single wide-angle shot, the system pinpoints the exact approach corridor and lane position of the responder.',
    howItWorks: [
      { step: 1, title: 'Lane 1 & 2', desc: 'Cover Road 1 (North approach).' },
      { step: 2, title: 'Lane 3 & 4', desc: 'Cover Road 2 (East approach).' },
      { step: 3, title: 'Lane 5 & 6', desc: 'Cover Road 3 (South approach).' },
      { step: 4, title: 'Lane 7 & 8', desc: 'Cover Road 4 (West approach).' }
    ],
    howToRead: 'Each tile shows the camera feed preview, a status dot (Standby, Processing, or Ambulance Verified), and the peak detection confidence percentage.',
    relatedFeatures: ['video-upload', 'ai-detection', 'junction-diagram']
  },
  {
    id: 'video-upload',
    title: 'Video Upload & Frame Extraction',
    category: 'Computer Vision',
    summary: 'Full-clip video scanning and time-segment clustering for edge-triggered preemption.',
    whatItIs: 'The video intake pipeline capable of ingesting surveillance footage, scanning entire clips at stride 3, and clustering consecutive detections into temporal presence segments [start_sec, end_sec].',
    whyItMatters: 'Scanning the whole video rather than exiting early allows the system to know exactly when an emergency vehicle enters AND leaves the camera frame, preventing infinite priority locks.',
    howItWorks: [
      { step: 1, title: 'Full Video Scan', desc: 'The backend decodes all frames at a stride of 3 frames, processing up to 300 seconds without early termination.' },
      { step: 2, title: 'Temporal Clustering', desc: 'Individual frame detections separated by 1.5 seconds or less are merged into continuous presence segments with peak confidence.' },
      { step: 3, title: 'Edge-Triggered Playback', desc: 'During video playback, preemption activates exactly when video timestamp t enters a segment (with 0.2s preroll) and clears 1.5s after leaving.' },
      { step: 4, title: 'Natural End Handling', desc: 'Videos play once without looping. When the clip finishes or is removed, active emergencies on that lane immediately clear.' }
    ],
    howToRead: 'Hover or tap a camera tile to reveal the "Upload Video" button. When analysis finishes, the video starts at 0:00 and triggers the junction only while the ambulance is actually visible.',
    relatedFeatures: ['cctv-lane-feeds', 'ai-detection', 'confidence-score']
  },
  {
    id: 'confidence-score',
    title: 'AI Detection Confidence Score',
    category: 'Computer Vision',
    summary: 'Probability metric representing the neural network certainty of vehicle detection.',
    whatItIs: 'A statistical confidence metric between 0.0 and 1.0 (expressed as 0% to 100%) indicating how certain the YOLO model is that a detected bounding box contains an ambulance.',
    whyItMatters: 'Emergency response demands high recall (avoiding missed ambulances) while HSV strobe verification eliminates false alarms from white delivery vans or bread trucks.',
    howItWorks: [
      { step: 1, title: 'YOLO Softmax Score', desc: 'Calculated from the model classification layer for class 0 (Ambulance).' },
      { step: 2, title: 'Threshold Filtering', desc: 'Detections above 20% are retained for strobe scanning.' },
      { step: 3, title: 'HSV Color Scanner', desc: 'The roof 35% is verified for flashing red and blue strobe light pixels.' }
    ],
    howToRead: 'A score of 94.6% means the model is highly confident the object is an emergency ambulance with active roof strobes.',
    relatedFeatures: ['ai-detection', 'video-analysis-statistics', 'evaluation-metrics']
  },
  {
    id: 'detection-timeline',
    title: 'Real-Time Detection Timeline',
    category: 'Activity & Audit',
    summary: 'Chronological activity log recording every signal phase change and vehicle alert.',
    whatItIs: 'A real-time, searchable activity log documenting every state change, detection event, confidence rating, and preemption override with precise session timestamps.',
    whyItMatters: 'Essential for post-incident municipal audits, traffic optimization reports, and legal verification of emergency signal preemption.',
    howItWorks: [
      { step: 1, title: 'Event Emission', desc: 'Whenever the controller ticks or an AI detection returns, an event is logged.' },
      { step: 2, title: 'Severity Tagging', desc: 'Events receive color badges: Red for Emergency, Cyan for AI Detections, Green for Normalcy.' },
      { step: 3, title: 'Ring Buffer', desc: 'Maintains the last 50 events in memory without bloating the client.' }
    ],
    howToRead: 'Read from top to bottom. Each item shows the elapsed timestamp (e.g. 00:14) and a plain-language summary of what occurred at the intersection.',
    relatedFeatures: ['emergency-event-summary', 'emergency-mode', 'system-status']
  },
  {
    id: 'video-analysis-statistics',
    title: 'Video Analysis Statistics',
    category: 'Performance',
    summary: 'Quantitative throughput metrics including real hardware FPS, total frames, and preemption duration.',
    whatItIs: 'Live operational telemetry tracking actual decoded frames, hardware processing speed (FPS), real processing duration in seconds, and priority duration.',
    whyItMatters: 'Accurate telemetry verifies that the AI model runs in true real-time and provides clear distinction between real backend video runs and client simulation runs.',
    howItWorks: [
      { step: 1, title: 'Real Video Telemetry', desc: 'When the backend processes a video, exact frame counts, duration, and hardware processing time are returned and accumulated.' },
      { step: 2, title: 'Processing FPS', desc: 'Calculated dynamically as total frames divided by total processing time, displaying "--" until real videos are processed.' },
      { step: 3, title: 'Single-Event Confidence', desc: 'Confidence values are recorded once per video arrival, eliminating duplicate event entries in confidence history.' },
      { step: 4, title: 'Simulation Tracking', desc: 'Simulated runs from Demo Mode are flagged and displayed with an "Includes simulated data" indicator.' }
    ],
    howToRead: 'Check the "Processing Speed" card on the Analysis page. Rates above 30 FPS mean the neural model processes video faster than real-time CCTV broadcast rate.',
    relatedFeatures: ['confidence-score', 'evaluation-metrics', 'cctv-lane-feeds']
  },
  {
    id: 'confusion-matrix',
    title: 'Model Confusion Matrix',
    category: 'Machine Learning',
    summary: 'Evaluation table breaking down True Positives, False Positives, False Negatives, and True Negatives.',
    whatItIs: 'A 2×2 statistical contingency table measuring the YOLOv11 model classification performance against a ground-truth validation dataset of 2,123 real traffic images.',
    whyItMatters: 'Proves whether the model actually discriminates between ambulances and normal traffic, demonstrating negligible false alarm rates.',
    howItWorks: [
      { step: 1, title: 'True Positives (TP: 411)', desc: 'Real ambulances correctly identified and granted priority.' },
      { step: 2, title: 'False Positives (FP: 79)', desc: 'Normal vehicles incorrectly flagged as ambulances.' },
      { step: 3, title: 'False Negatives (FN: 73)', desc: 'Ambulances missed due to severe occlusion or distance.' },
      { step: 4, title: 'True Negatives (TN: 1,560)', desc: 'Normal cars, buses, and trucks correctly recognized as non-emergency.' }
    ],
    howToRead: 'High values in TP (411) and TN (1,560) combined with low FP (79) confirm high reliability in live municipal intersections.',
    relatedFeatures: ['evaluation-metrics', 'ai-detection', 'confidence-score']
  },
  {
    id: 'evaluation-metrics',
    title: 'Evaluation Metrics (Precision, Recall, mAP)',
    category: 'Machine Learning',
    summary: 'Quantitative evaluation benchmarks assessing precision, recall, F1, and mean average precision.',
    whatItIs: 'Standardized quantitative evaluation benchmarks assessing how well the trained YOLO neural network performs on validation data, with real-time indicators of data provenance.',
    whyItMatters: 'Provides mathematical verification of model reliability before deployment and guarantees that operators know whether they are viewing static validation baseline data or live server metrics.',
    howItWorks: [
      { step: 1, title: 'Provenance Tracking', desc: 'Badged as "Live from server" when connected to the backend GET /metrics endpoint, or "Validation run (static)" when offline.' },
      { step: 2, title: 'Precision (83.9%)', desc: 'Measures how many detected ambulances were genuine, minimizing costly false alarm interruptions.' },
      { step: 3, title: 'Recall (84.9%)', desc: 'Measures how many actual ambulances in the footage were spotted, minimizing missed emergencies.' },
      { step: 4, title: 'F1 Score (84.4%)', desc: 'The balanced harmonic mean between precision and recall.' },
      { step: 5, title: 'mAP@50 (88.1%) & mAP@50-95 (67.7%)', desc: 'Mean Average Precision evaluated across standard (0.50) and rigorous (0.50 to 0.95) IoU overlap thresholds.' }
    ],
    howToRead: 'Scores above 80% in both Precision and Recall represent high-grade computer vision performance. Check the badge to see if metrics are currently served live or from the validation baseline.',
    relatedFeatures: ['confusion-matrix', 'ai-detection', 'video-analysis-statistics']
  },
  {
    id: 'emergency-event-summary',
    title: 'Emergency Event Summary',
    category: 'Activity & Audit',
    summary: 'Post-incident summary card documenting target lanes, activated signals, and recovery status.',
    whatItIs: 'A structured post-incident summary card generated after an emergency vehicle passes through the intersection, providing an instant debrief for traffic operators.',
    whyItMatters: 'Gives dispatchers and emergency service supervisors immediate confirmation that priority was granted and that the intersection safely restored normal cycling.',
    howItWorks: [
      { step: 1, title: 'Target Lane Confirmation', desc: 'Identifies which specific lane detected the incoming vehicle.' },
      { step: 2, title: 'Signal Action Verification', desc: 'Confirms that the correct road signal turned Green while cross-traffic was held at Red.' },
      { step: 3, title: 'Restoration Audit', desc: 'Logs whether normal cyclic operation was cleanly recovered after clearance.' }
    ],
    howToRead: 'If an emergency occurred during the session, this card displays the confirmed lane, the activated signal, and a green "Automated Recovery" confirmation.',
    relatedFeatures: ['detection-timeline', 'emergency-mode', 'signal-priority-logic']
  }
];

export function getLearnTopicById(id) {
  return LEARN_TOPICS.find((topic) => topic.id === id) || null;
}
