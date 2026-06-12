$BASE = "http://localhost:5000/api/v1"
$errors = 0; $passed = 0

function Test-Route {
  param($label, $method, $url, $body, $token)
  $headers = @{ "Content-Type" = "application/json" }
  if ($token) { $headers["Authorization"] = "Bearer $token" }
  try {
    $resp = if ($body) {
      Invoke-RestMethod -Uri $url -Method $method -Headers $headers -Body ($body | ConvertTo-Json -Depth 5) -EA Stop
    } else {
      Invoke-RestMethod -Uri $url -Method $method -Headers $headers -EA Stop
    }
    Write-Host "  PASS  $label" -ForegroundColor Green
    $script:passed++; return $resp
  } catch {
    $msg = ($_.ErrorDetails.Message | ConvertFrom-Json -EA SilentlyContinue).message
    Write-Host "  FAIL  $label -- $msg" -ForegroundColor Red
    $script:errors++; return $null
  }
}

Write-Host "`n=== EduFlow Phase 2 API Verification ===" -ForegroundColor Cyan

# Auth
Write-Host "`n[AUTH]" -ForegroundColor Yellow
$a = Test-Route "Login admin"   POST "$BASE/auth/login" @{email="admin@eduflow.com";password="Demo@1234"}
$t = Test-Route "Login teacher" POST "$BASE/auth/login" @{email="teacher@eduflow.com";password="Demo@1234"}
$s = Test-Route "Login student" POST "$BASE/auth/login" @{email="student@eduflow.com";password="Demo@1234"}
$p = Test-Route "Login parent"  POST "$BASE/auth/login" @{email="parent@eduflow.com";password="Demo@1234"}
$aT = $a.data.accessToken; $tT = $t.data.accessToken
$sT = $s.data.accessToken; $pT = $p.data.accessToken
Test-Route "GET /me (admin)" GET "$BASE/auth/me" $null $aT | Out-Null

# Dashboard
Write-Host "`n[DASHBOARD]" -ForegroundColor Yellow
Test-Route "Admin dashboard"   GET "$BASE/dashboard" $null $aT | Out-Null
Test-Route "Teacher dashboard" GET "$BASE/dashboard" $null $tT | Out-Null
Test-Route "Student dashboard" GET "$BASE/dashboard" $null $sT | Out-Null
Test-Route "Parent dashboard"  GET "$BASE/dashboard" $null $pT | Out-Null

# Subjects
Write-Host "`n[SUBJECTS]" -ForegroundColor Yellow
$subs  = Test-Route "List subjects" GET "$BASE/subjects" $null $aT
$subId = $subs.data.data[0]._id
Test-Route "Get subject"    GET   "$BASE/subjects/$subId"  $null                      $tT | Out-Null
Test-Route "Create subject" POST  "$BASE/subjects"         @{name="Economics";code="ECO99";department="Commerce";grades=@(11,12)} $aT | Out-Null
Test-Route "Update subject" PATCH "$BASE/subjects/$subId"  @{description="Updated"}   $aT | Out-Null

# Classes
Write-Host "`n[CLASSES]" -ForegroundColor Yellow
$cls   = Test-Route "List classes" GET "$BASE/classes" $null $aT
$clsId = $cls.data.data[0]._id
Test-Route "Get class"         GET   "$BASE/classes/$clsId"          $null           $tT | Out-Null
Test-Route "Get class students"GET   "$BASE/classes/$clsId/students" $null           $tT | Out-Null
Test-Route "Update class"      PATCH "$BASE/classes/$clsId"          @{room="B-201"} $aT | Out-Null

# Teachers
Write-Host "`n[TEACHERS]" -ForegroundColor Yellow
$tch  = Test-Route "List teachers" GET "$BASE/teachers" $null $aT
$tchId = $tch.data.data[0]._id
Test-Route "Get teacher"    GET   "$BASE/teachers/$tchId" $null              $aT | Out-Null
Test-Route "Update teacher" PATCH "$BASE/teachers/$tchId" @{department="STEM"} $aT | Out-Null

# Students
Write-Host "`n[STUDENTS]" -ForegroundColor Yellow
$stus  = Test-Route "List students" GET "$BASE/students" $null $aT
$stuId = $stus.data.data[0]._id
Test-Route "Get student"    GET   "$BASE/students/$stuId" $null              $tT | Out-Null
Test-Route "Update student" PATCH "$BASE/students/$stuId" @{bloodGroup="B+"} $aT | Out-Null

# Attendance
Write-Host "`n[ATTENDANCE]" -ForegroundColor Yellow
Test-Route "Today summary"   GET "$BASE/attendance/today-summary"              $null $aT | Out-Null
Test-Route "Student summary" GET "$BASE/attendance/student/$stuId/summary"     $null $tT | Out-Null
Test-Route "Class history"   GET "$BASE/attendance/class/$clsId"               $null $tT | Out-Null
$today = (Get-Date).AddDays(-1).ToString("yyyy-MM-dd")   # yesterday to avoid duplicate
Test-Route "Mark attendance" POST "$BASE/attendance" @{classId=$clsId;date=$today;session="morning";records=@(@{student=$stuId;status="present"})} $tT | Out-Null

# Assignments
Write-Host "`n[ASSIGNMENTS]" -ForegroundColor Yellow
$asgn  = Test-Route "List assignments" GET "$BASE/assignments" $null $tT
$asnId = $asgn.data.data[0]._id
Test-Route "Get assignment" GET   "$BASE/assignments/$asnId" $null                $sT | Out-Null
Test-Route "Update assign"  PATCH "$BASE/assignments/$asnId" @{instructions="v2"} $tT | Out-Null
Test-Route "Student submit" POST  "$BASE/assignments/$asnId/submit" @{content="Answer: x=3, y=5"} $sT | Out-Null

# Notices
Write-Host "`n[NOTICES]" -ForegroundColor Yellow
$nts  = Test-Route "List notices (admin)"  GET "$BASE/notices" $null $aT
$ntId = $nts.data.data[0]._id
Test-Route "Get notice (student)" GET "$BASE/notices/$ntId"  $null $sT | Out-Null
Test-Route "List notices (parent)" GET "$BASE/notices"       $null $pT | Out-Null
$nn   = Test-Route "Create notice" POST "$BASE/notices" @{title="Verify Notice";content="Content body text here for the notice.";priority="high";category="general"} $aT
if ($nn) {
  Test-Route "Pin notice"    PATCH  "$BASE/notices/$($nn.data.notice._id)/pin" @{isPinned=$true}  $aT | Out-Null
  Test-Route "Delete notice" DELETE "$BASE/notices/$($nn.data.notice._id)"     $null              $aT | Out-Null
}

# Users
Write-Host "`n[USERS]" -ForegroundColor Yellow
$usrs = Test-Route "List users (admin)" GET "$BASE/users" $null $aT
Test-Route "Update my profile" PATCH "$BASE/users/me" @{phone="+1-800-EDUFLOW"} $tT | Out-Null
Test-Route "RBAC: teacher list users (should fail)" GET "$BASE/users" $null $tT | Out-Null

Write-Host "`n$('=' * 45)" -ForegroundColor Cyan
Write-Host "  PASSED : $passed" -ForegroundColor Green
if ($errors -gt 0) {
  Write-Host "  FAILED : $errors" -ForegroundColor Red
} else {
  Write-Host "  FAILED : $errors  -- ALL CLEAR" -ForegroundColor Green
}
Write-Host ""
