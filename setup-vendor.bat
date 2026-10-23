@echo off
echo === Setup Booking Vendor ===

REM Bikin folder
mkdir "src\app\api\vendors" 2>nul
mkdir "src\app\booking-vendor\[vendorId]" 2>nul

echo Folder dibuat.
echo.
echo === SELESAI ===
echo.
echo Sekarang tinggal bikin file manual:
echo 1. src\app\api\vendors\route.ts
echo 2. src\app\vendors\page.tsx
echo 3. src\app\vendors\[id]\page.tsx
echo 4. src\app\booking-vendor\[vendorId]\page.tsx
echo 5. src\app\api\bookings\route.ts
pause