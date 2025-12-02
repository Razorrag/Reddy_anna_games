# Create final aliases for remaining missing imports

$aliases = @{
    # Admin mutations - missing directory prefix
    'src/hooks/mutations/useStopRoundMutation.ts' = @'
export { useStopRoundMutation } from '@/hooks/mutations/admin/useStopRoundMutation';
export { useStopRoundMutation as default } from '@/hooks/mutations/admin/useStopRoundMutation';
'@

    'src/hooks/mutations/useDeclareWinnerMutation.ts' = @'
export { useDeclareWinnerMutation } from '@/hooks/mutations/admin/useDeclareWinnerMutation';
export { useDeclareWinnerMutation as default } from '@/hooks/mutations/admin/useDeclareWinnerMutation';
'@

    'src/hooks/mutations/useEmergencyStopMutation.ts' = @'
export { useEmergencyStopMutation } from '@/hooks/mutations/admin/useEmergencyStopMutation';
export { useEmergencyStopMutation as default } from '@/hooks/mutations/admin/useEmergencyStopMutation';
'@

    'src/hooks/mutations/useUpdateGameSettingsMutation.ts' = @'
export { useUpdateGameSettingsMutation } from '@/hooks/mutations/admin/useUpdateGameSettingsMutation';
export { useUpdateGameSettingsMutation as default } from '@/hooks/mutations/admin/useUpdateGameSettingsMutation';
'@

    'src/hooks/mutations/useUpdatePartnerMutation.ts' = @'
export { useUpdatePartnerMutation } from '@/hooks/mutations/admin/useUpdatePartnerMutation';
export { useUpdatePartnerMutation as default } from '@/hooks/mutations/admin/useUpdatePartnerMutation';
'@

    'src/hooks/mutations/useSuspendPartnerMutation.ts' = @'
export { useSuspendPartnerMutation } from '@/hooks/mutations/admin/useSuspendPartnerMutation';
export { useSuspendPartnerMutation as default } from '@/hooks/mutations/admin/useSuspendPartnerMutation';
'@

    'src/hooks/mutations/useBanPartnerMutation.ts' = @'
export { useBanPartnerMutation } from '@/hooks/mutations/admin/useBanPartnerMutation';
export { useBanPartnerMutation as default } from '@/hooks/mutations/admin/useBanPartnerMutation';
'@

    'src/hooks/mutations/useProcessPayoutMutation.ts' = @'
export { useProcessPayoutMutation } from '@/hooks/mutations/admin/useProcessPayoutMutation';
export { useProcessPayoutMutation as default } from '@/hooks/mutations/admin/useProcessPayoutMutation';
'@

    'src/hooks/mutations/useUpdateSystemSettingsMutation.ts' = @'
export { useUpdateSystemSettingsMutation } from '@/hooks/mutations/admin/useUpdateSystemSettingsMutation';
export { useUpdateSystemSettingsMutation as default } from '@/hooks/mutations/admin/useUpdateSystemSettingsMutation';
'@

    'src/hooks/mutations/useSuspendUserMutation.ts' = @'
export { useSuspendUserMutation } from '@/hooks/mutations/admin/useSuspendUserMutation';
export { useSuspendUserMutation as default } from '@/hooks/mutations/admin/useSuspendUserMutation';
'@

    'src/hooks/mutations/useBanUserMutation.ts' = @'
export { useBanUserMutation } from '@/hooks/mutations/admin/useBanUserMutation';
export { useBanUserMutation as default } from '@/hooks/mutations/admin/useBanUserMutation';
'@

    'src/hooks/mutations/useVerifyUserMutation.ts' = @'
export { useVerifyUserMutation } from '@/hooks/mutations/admin/useVerifyUserMutation';
export { useVerifyUserMutation as default } from '@/hooks/mutations/admin/useVerifyUserMutation';
'@

    'src/hooks/mutations/useDeleteUserMutation.ts' = @'
export { useDeleteUserMutation } from '@/hooks/mutations/admin/useDeleteUserMutation';
export { useDeleteUserMutation as default } from '@/hooks/mutations/admin/useDeleteUserMutation';
'@

    'src/hooks/mutations/useBulkUserActionMutation.ts' = @'
export { useBulkUserActionMutation } from '@/hooks/mutations/admin/useBulkUserActionMutation';
export { useBulkUserActionMutation as default } from '@/hooks/mutations/admin/useBulkUserActionMutation';
'@

    # Partner mutations - missing directory prefix
    'src/hooks/mutations/useCreatePayoutRequestMutation.ts' = @'
export { useCreatePayoutRequestMutation } from '@/hooks/mutations/partner/useCreatePayoutRequestMutation';
export { useCreatePayoutRequestMutation as default } from '@/hooks/mutations/partner/useCreatePayoutRequestMutation';
'@

    'src/hooks/mutations/useCancelPayoutRequestMutation.ts' = @'
export { useCancelPayoutRequestMutation } from '@/hooks/mutations/partner/useCancelPayoutRequestMutation';
export { useCancelPayoutRequestMutation as default } from '@/hooks/mutations/partner/useCancelPayoutRequestMutation';
'@

    'src/hooks/mutations/useUpdatePartnerProfileMutation.ts' = @'
export { useUpdatePartnerProfileMutation } from '@/hooks/mutations/partner/useUpdatePartnerProfileMutation';
export { useUpdatePartnerProfileMutation as default } from '@/hooks/mutations/partner/useUpdatePartnerProfileMutation';
'@

    'src/hooks/mutations/useUpdatePartnerPasswordMutation.ts' = @'
export { useUpdatePartnerPasswordMutation } from '@/hooks/mutations/partner/useUpdatePartnerPasswordMutation';
export { useUpdatePartnerPasswordMutation as default } from '@/hooks/mutations/partner/useUpdatePartnerPasswordMutation';
'@

    'src/hooks/mutations/useUpdatePartnerPreferencesMutation.ts' = @'
export { useUpdatePartnerPreferencesMutation } from '@/hooks/mutations/partner/useUpdatePartnerPreferencesMutation';
export { useUpdatePartnerPreferencesMutation as default } from '@/hooks/mutations/partner/useUpdatePartnerPreferencesMutation';
'@
}

Write-Host "Creating final alias files..." -ForegroundColor Cyan

$created = 0
$skipped = 0

foreach ($path in $aliases.Keys) {
    if (Test-Path $path) {
        Write-Host "  EXISTS: $path" -ForegroundColor Gray
        $skipped++
        continue
    }
    
    Set-Content -Path $path -Value $aliases[$path] -Encoding UTF8
    Write-Host "  CREATED: $path" -ForegroundColor Green
    $created++
}

Write-Host "`nSummary:" -ForegroundColor Cyan
Write-Host "  Created: $created" -ForegroundColor Green
Write-Host "  Skipped: $skipped" -ForegroundColor Yellow
Write-Host "  Total: $($aliases.Count)" -ForegroundColor White