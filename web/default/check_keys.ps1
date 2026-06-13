$content = Get-Content "C:\Users\lenovo\new-api-app\web\default\src\i18n\locales\en.json" -Raw -Encoding UTF8
$json = ConvertFrom-Json $content

$keys = @(
"Documentation","Developer Documentation","Copied","Copy","I","Quick Start","II","API Key Management","III",
"API Calls","Base URL","Authentication","cURL Example","Python Example","JavaScript Example","IV","Model List","V",
"Billing","Billing Unit","Top-up Methods","VI","FAQ","VII","Technical Support","Email Support: ",
"Submit an Issue","Table of Contents","Back to Top","AI Models Connected","Core Capabilities","99.9% Uptime",
"Tech Architecture","Backend","Frontend","Infrastructure","Acknowledgments","GitHub Repository",
"AGPL v3.0 Open Source License","Contact Us","Based on","Licensed under AGPL v3.0","Alibaba Tongyi"
)

foreach ($k in $keys) { $p = $json.translation.PSObject.Properties[$k]; if ($p) { Write-Host "EXISTS: $k" } else { Write-Host "MISSING: $k" } }
