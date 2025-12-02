# Create stub implementations for remaining missing hooks and components

Write-Host "Creating remaining stub files..." -ForegroundColor Cyan

# UI Components
$uiComponents = @{
    'src/components/ui/textarea.tsx' = @'
import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
'@

    'src/components/ui/switch.tsx' = @'
import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
'@
}

# Utility Hooks
$utilityHooks = @{
    'src/hooks/useWindowSize.ts' = @'
import { useState, useEffect } from 'react';

interface WindowSize {
  width: number;
  height: number;
}

export function useWindowSize(): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}
'@
}

# Stub Mutation Hooks (no-op functions)
$stubMutations = @{
    'src/hooks/mutations/user/useChangePassword.ts' = @'
import { useMutation } from '@tanstack/react-query';

export function useChangePassword() {
  return useMutation({
    mutationFn: async (data: { oldPassword: string; newPassword: string }) => {
      console.warn('useChangePassword: Stub implementation');
      return { success: true };
    },
  });
}
'@

    'src/hooks/mutations/user/useUpdateNotificationSettings.ts' = @'
import { useMutation } from '@tanstack/react-query';

export function useUpdateNotificationSettings() {
  return useMutation({
    mutationFn: async (data: any) => {
      console.warn('useUpdateNotificationSettings: Stub implementation');
      return { success: true };
    },
  });
}
'@

    'src/hooks/mutations/user/useUploadVerificationDocument.ts' = @'
import { useMutation } from '@tanstack/react-query';

export function useUploadVerificationDocument() {
  return useMutation({
    mutationFn: async (file: File) => {
      console.warn('useUploadVerificationDocument: Stub implementation');
      return { success: true };
    },
  });
}
'@

    'src/hooks/mutations/bonus/useUnlockBonus.ts' = @'
import { useMutation } from '@tanstack/react-query';

export function useUnlockBonus() {
  return useMutation({
    mutationFn: async (bonusId: string) => {
      console.warn('useUnlockBonus: Stub implementation');
      return { success: true };
    },
  });
}
'@

    'src/hooks/mutations/notification/useMarkNotificationRead.ts' = @'
import { useMutation } from '@tanstack/react-query';

export function useMarkNotificationRead() {
  return useMutation({
    mutationFn: async (notificationId: string) => {
      console.warn('useMarkNotificationRead: Stub implementation');
      return { success: true };
    },
  });
}
'@

    'src/hooks/mutations/notification/useDeleteNotification.ts' = @'
import { useMutation } from '@tanstack/react-query';

export function useDeleteNotification() {
  return useMutation({
    mutationFn: async (notificationId: string) => {
      console.warn('useDeleteNotification: Stub implementation');
      return { success: true };
    },
  });
}
'@

    'src/hooks/mutations/support/useSubmitSupportTicket.ts' = @'
import { useMutation } from '@tanstack/react-query';

export function useSubmitSupportTicket() {
  return useMutation({
    mutationFn: async (data: { subject: string; message: string }) => {
      console.warn('useSubmitSupportTicket: Stub implementation');
      return { success: true };
    },
  });
}
'@

    'src/hooks/mutations/admin/useSuspendUserMutation.ts' = @'
import { useMutation } from '@tanstack/react-query';

export function useSuspendUserMutation() {
  return useMutation({
    mutationFn: async (userId: string) => {
      console.warn('useSuspendUserMutation: Stub implementation');
      return { success: true };
    },
  });
}
'@

    'src/hooks/mutations/admin/useBanUserMutation.ts' = @'
import { useMutation } from '@tanstack/react-query';

export function useBanUserMutation() {
  return useMutation({
    mutationFn: async (userId: string) => {
      console.warn('useBanUserMutation: Stub implementation');
      return { success: true };
    },
  });
}
'@

    'src/hooks/mutations/admin/useVerifyUserMutation.ts' = @'
import { useMutation } from '@tanstack/react-query';

export function useVerifyUserMutation() {
  return useMutation({
    mutationFn: async (userId: string) => {
      console.warn('useVerifyUserMutation: Stub implementation');
      return { success: true };
    },
  });
}
'@

    'src/hooks/mutations/admin/useDeleteUserMutation.ts' = @'
import { useMutation } from '@tanstack/react-query';

export function useDeleteUserMutation() {
  return useMutation({
    mutationFn: async (userId: string) => {
      console.warn('useDeleteUserMutation: Stub implementation');
      return { success: true };
    },
  });
}
'@

    'src/hooks/mutations/admin/useBulkUserActionMutation.ts' = @'
import { useMutation } from '@tanstack/react-query';

export function useBulkUserActionMutation() {
  return useMutation({
    mutationFn: async (data: { userIds: string[]; action: string }) => {
      console.warn('useBulkUserActionMutation: Stub implementation');
      return { success: true };
    },
  });
}
'@

    'src/hooks/mutations/admin/useUpdatePartnerMutation.ts' = @'
import { useMutation } from '@tanstack/react-query';

export function useUpdatePartnerMutation() {
  return useMutation({
    mutationFn: async (data: { partnerId: string; updates: any }) => {
      console.warn('useUpdatePartnerMutation: Stub implementation');
      return { success: true };
    },
  });
}
'@

    'src/hooks/mutations/admin/useSuspendPartnerMutation.ts' = @'
import { useMutation } from '@tanstack/react-query';

export function useSuspendPartnerMutation() {
  return useMutation({
    mutationFn: async (partnerId: string) => {
      console.warn('useSuspendPartnerMutation: Stub implementation');
      return { success: true };
    },
  });
}
'@

    'src/hooks/mutations/admin/useBanPartnerMutation.ts' = @'
import { useMutation } from '@tanstack/react-query';

export function useBanPartnerMutation() {
  return useMutation({
    mutationFn: async (partnerId: string) => {
      console.warn('useBanPartnerMutation: Stub implementation');
      return { success: true };
    },
  });
}
'@

    'src/hooks/mutations/admin/useProcessPayoutMutation.ts' = @'
import { useMutation } from '@tanstack/react-query';

export function useProcessPayoutMutation() {
  return useMutation({
    mutationFn: async (payoutId: string) => {
      console.warn('useProcessPayoutMutation: Stub implementation');
      return { success: true };
    },
  });
}
'@

    'src/hooks/mutations/admin/useStopRoundMutation.ts' = @'
import { useMutation } from '@tanstack/react-query';

export function useStopRoundMutation() {
  return useMutation({
    mutationFn: async () => {
      console.warn('useStopRoundMutation: Stub implementation');
      return { success: true };
    },
  });
}
'@

    'src/hooks/mutations/admin/useDeclareWinnerMutation.ts' = @'
import { useMutation } from '@tanstack/react-query';

export function useDeclareWinnerMutation() {
  return useMutation({
    mutationFn: async (data: { winningSide: string }) => {
      console.warn('useDeclareWinnerMutation: Stub implementation');
      return { success: true };
    },
  });
}
'@

    'src/hooks/mutations/admin/useEmergencyStopMutation.ts' = @'
import { useMutation } from '@tanstack/react-query';

export function useEmergencyStopMutation() {
  return useMutation({
    mutationFn: async () => {
      console.warn('useEmergencyStopMutation: Stub implementation');
      return { success: true };
    },
  });
}
'@

    'src/hooks/mutations/admin/useUpdateGameSettingsMutation.ts' = @'
import { useMutation } from '@tanstack/react-query';

export function useUpdateGameSettingsMutation() {
  return useMutation({
    mutationFn: async (settings: any) => {
      console.warn('useUpdateGameSettingsMutation: Stub implementation');
      return { success: true };
    },
  });
}
'@

    'src/hooks/mutations/admin/useUpdateSystemSettingsMutation.ts' = @'
import { useMutation } from '@tanstack/react-query';

export function useUpdateSystemSettingsMutation() {
  return useMutation({
    mutationFn: async (settings: any) => {
      console.warn('useUpdateSystemSettingsMutation: Stub implementation');
      return { success: true };
    },
  });
}
'@

    'src/hooks/mutations/partner/useCreatePayoutRequestMutation.ts' = @'
import { useMutation } from '@tanstack/react-query';

export function useCreatePayoutRequestMutation() {
  return useMutation({
    mutationFn: async (amount: number) => {
      console.warn('useCreatePayoutRequestMutation: Stub implementation');
      return { success: true };
    },
  });
}
'@

    'src/hooks/mutations/partner/useCancelPayoutRequestMutation.ts' = @'
import { useMutation } from '@tanstack/react-query';

export function useCancelPayoutRequestMutation() {
  return useMutation({
    mutationFn: async (requestId: string) => {
      console.warn('useCancelPayoutRequestMutation: Stub implementation');
      return { success: true };
    },
  });
}
'@

    'src/hooks/mutations/partner/useUpdatePartnerProfileMutation.ts' = @'
import { useMutation } from '@tanstack/react-query';

export function useUpdatePartnerProfileMutation() {
  return useMutation({
    mutationFn: async (data: any) => {
      console.warn('useUpdatePartnerProfileMutation: Stub implementation');
      return { success: true };
    },
  });
}
'@

    'src/hooks/mutations/partner/useUpdatePartnerPasswordMutation.ts' = @'
import { useMutation } from '@tanstack/react-query';

export function useUpdatePartnerPasswordMutation() {
  return useMutation({
    mutationFn: async (data: { oldPassword: string; newPassword: string }) => {
      console.warn('useUpdatePartnerPasswordMutation: Stub implementation');
      return { success: true };
    },
  });
}
'@

    'src/hooks/mutations/partner/useUpdatePartnerPreferencesMutation.ts' = @'
import { useMutation } from '@tanstack/react-query';

export function useUpdatePartnerPreferencesMutation() {
  return useMutation({
    mutationFn: async (preferences: any) => {
      console.warn('useUpdatePartnerPreferencesMutation: Stub implementation');
      return { success: true };
    },
  });
}
'@
}

# Stub Query Hooks (empty data)
$stubQueries = @{
    'src/hooks/queries/bonus/useUserBonuses.ts' = @'
import { useQuery } from '@tanstack/react-query';

export function useUserBonuses() {
  return useQuery({
    queryKey: ['user-bonuses'],
    queryFn: async () => {
      console.warn('useUserBonuses: Stub implementation');
      return [];
    },
  });
}
'@

    'src/hooks/queries/game/useUserGameHistory.ts' = @'
import { useQuery } from '@tanstack/react-query';

export function useUserGameHistory() {
  return useQuery({
    queryKey: ['user-game-history'],
    queryFn: async () => {
      console.warn('useUserGameHistory: Stub implementation');
      return [];
    },
  });
}
'@

    'src/hooks/queries/notification/useUserNotifications.ts' = @'
import { useQuery } from '@tanstack/react-query';

export function useUserNotifications() {
  return useQuery({
    queryKey: ['user-notifications'],
    queryFn: async () => {
      console.warn('useUserNotifications: Stub implementation');
      return [];
    },
  });
}
'@

    'src/hooks/queries/referral/useUserReferrals.ts' = @'
import { useQuery } from '@tanstack/react-query';

export function useUserReferrals() {
  return useQuery({
    queryKey: ['user-referrals'],
    queryFn: async () => {
      console.warn('useUserReferrals: Stub implementation');
      return [];
    },
  });
}
'@
}

# Combine all files
$allFiles = @{}
$allFiles += $uiComponents
$allFiles += $utilityHooks
$allFiles += $stubMutations
$allFiles += $stubQueries

$created = 0
$skipped = 0

foreach ($path in $allFiles.Keys) {
    if (Test-Path $path) {
        Write-Host "  EXISTS: $path" -ForegroundColor Gray
        $skipped++
        continue
    }
    
    # Create directory
    $dir = Split-Path $path -Parent
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
    
    # Write file
    Set-Content -Path $path -Value $allFiles[$path] -Encoding UTF8
    Write-Host "  CREATED: $path" -ForegroundColor Green
    $created++
}

Write-Host "`nSummary:" -ForegroundColor Cyan
Write-Host "  Created: $created" -ForegroundColor Green
Write-Host "  Skipped: $skipped" -ForegroundColor Yellow
Write-Host "  Total files: $($allFiles.Count)" -ForegroundColor White