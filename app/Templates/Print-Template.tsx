// PrintTemplate.js
export const generatePrintHTML = (departmentData) => {
    if (!departmentData || !departmentData.indicators) {
        console.error('Invalid department data:', departmentData);
        return '<div>Error: Invalid department data</div>';
    }

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${departmentData.name} - Performance Report</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 5mm; 
            color: #333; 
            line-height: 1.2;
            font-size: 9pt;
        }
        .header { 
            text-align: center; 
            margin-bottom: 3mm;
            padding-bottom: 1mm;
            border-bottom: 0.5px solid #eee;
        }
        .title { 
            color: #6b4c8c; 
            font-size: 11pt; 
            font-weight: bold; 
            margin-bottom: 1mm;
        }
        .subtitle { 
            color: #666; 
            font-size: 8pt; 
            margin-bottom: 2mm; 
        }
        .indicator-container {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(45%, 1fr));
            gap: 3mm;
        }
        .indicator { 
            break-inside: avoid;
            page-break-inside: avoid;
            border: 0.5px solid #e0e0e0;
            padding: 2mm;
            border-radius: 1mm;
        }
        .indicator-name { 
            font-weight: bold; 
            font-size: 9pt; 
            color: #6b4c8c;
            margin-bottom: 1mm;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .indicator-target { 
            font-style: italic; 
            color: #666; 
            margin-bottom: 2mm;
            font-size: 8pt;
        }
        .week { 
            margin-bottom: 2mm;
        }
        .week-label { 
            font-weight: bold; 
            color: #444;
            margin-bottom: 0.5mm;
            font-size: 8pt;
        }
        .week-dates { 
            color: #666; 
            font-size: 7pt;
            margin-bottom: 1mm;
        }
        table { 
            width: 100%; 
            border-collapse: collapse;
            font-size: 8pt;
        }
        th { 
            background-color: #6b4c8c; 
            color: white; 
            padding: 0.5mm 1mm; 
            text-align: center;
            font-weight: bold;
        }
        td { 
            padding: 0.5mm 1mm; 
            border: 0.5px solid #ddd; 
            text-align: center;
        }
        .footer { 
            margin-top: 3mm; 
            font-size: 7pt; 
            color: #999; 
            text-align: center;
        }
        @page {
            size: auto;
            margin: 5mm;
        }
        @media print {
            body { 
                margin: 0; 
                padding: 0;
            }
            .indicator-container {
                grid-template-columns: repeat(2, 1fr);
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">${departmentData.name} Performance Report</div>
        <div class="subtitle">Generated on ${departmentData.printDate}</div>
    </div>
    
    <div class="indicator-container">
    ${departmentData.indicators.map(indicator => `
        <div class="indicator">
            <div class="indicator-name">${indicator.name}</div>
            <div class="indicator-target">Target: ${indicator.target}</div>
            
            ${indicator.weeklyData.map(week => `
                <div class="week">
                    <div class="week-label">${week.weekLabel}</div>
                    <div class="week-dates">${week.dateRange}</div>
                    <table>
                        <tr>
                            ${week.dailyValues.map(day => `
                                <th>${day.day}</th>
                            `).join('')}
                        </tr>
                        <tr>
                            ${week.dailyValues.map(day => `
                                <td>${day.value}</td>
                            `).join('')}
                        </tr>
                    </table>
                </div>
            `).join('')}
        </div>
    `).join('')}
    </div>
    
    <div class="footer">
        KS Production System - Confidential Report
    </div>
</body>
</html>
`;
};