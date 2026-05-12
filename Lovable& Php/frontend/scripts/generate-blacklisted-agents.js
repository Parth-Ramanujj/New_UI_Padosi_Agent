// This script parses the blacklisted agents markdown data and generates JSON
// Run: node scripts/generate-blacklisted-agents.js

const fs = require('fs');
const path = require('path');

// Sample data structure - in production, this would read from the parsed markdown file
// The data is in format: |SR.NO|Insurer|Insurer type|PAN|Agent Name|Agency Code|Blacklisted date|

function parseMarkdownTable(markdownContent) {
  const lines = markdownContent.split('\n');
  const agents = [];
  
  for (const line of lines) {
    // Skip header and separator lines
    if (line.startsWith('|SR.NO') || line.startsWith('|-') || !line.startsWith('|')) {
      continue;
    }
    
    // Parse table row
    const parts = line.split('|').filter(p => p.trim());
    if (parts.length >= 7) {
      agents.push({
        srNo: parseInt(parts[0].trim(), 10),
        insurer: parts[1].trim(),
        insurerType: parts[2].trim(),
        pan: parts[3].trim(),
        agentName: parts[4].trim(),
        agencyCode: parts[5].trim(),
        blacklistedDate: parts[6].trim()
      });
    }
  }
  
  return agents;
}

// Generate sample data for testing
const sampleData = [
  { srNo: 1, insurer: "Aditya Birla Health Insurance Company Ltd", insurerType: "HEALTH", pan: "ABYPA3634P", agentName: "Amanullah Ahmed", agencyCode: "ABH1105664", blacklistedDate: "23-Sep-2022 12:00 AM" },
  { srNo: 2, insurer: "Aditya Birla Health Insurance Company Ltd", insurerType: "HEALTH", pan: "AMDPM6058R", agentName: "Darshana P Mahadik", agencyCode: "ABH1106796", blacklistedDate: "17-Jan-2024 12:00 AM" },
  // Add more sample entries as needed
];

const outputPath = path.join(__dirname, '..', 'public', 'blacklisted-agents.json');
fs.writeFileSync(outputPath, JSON.stringify(sampleData, null, 2));
console.log(`Generated ${sampleData.length} entries to ${outputPath}`);
