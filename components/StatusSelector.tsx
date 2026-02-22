import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Check, ChevronsUpDown } from 'lucide-react';

export type FormStatus = 'draft' | 'active' | 'paused' | 'archived';

interface StatusSelectorProps {
  currentStatus: FormStatus;
  onChange: (newStatus: FormStatus) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig: Record<FormStatus, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  draft: { label: 'Черновик', variant: 'secondary' },
  active: { label: 'Активна', variant: 'default' },
  paused: { label: 'Приостановлена', variant: 'secondary' },
  archived: { label: 'Архивирована', variant: 'outline' },
};

export const StatusSelector: React.FC<StatusSelectorProps> = ({ currentStatus, onChange, disabled, size = 'md' }) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (status: FormStatus) => {
    if (status !== currentStatus) {
      onChange(status);
    }
    setOpen(false);
  };

  const currentStatusInfo = statusConfig[currentStatus] || statusConfig.draft;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <Badge
          variant={currentStatusInfo.variant}
          className={`cursor-pointer hover:opacity-90 transition-opacity flex items-center gap-1 ${
            size === 'sm' ? 'text-sm px-2 py-0.5' :
            size === 'lg' ? 'text-lg px-4 py-2' :
            'text-base px-3 py-1' // md
          }`}
        >
          {currentStatusInfo.label}
          <ChevronsUpDown className="h-3 w-3 opacity-50" />
        </Badge>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {(Object.entries(statusConfig) as [FormStatus, typeof statusConfig[FormStatus]][]).map(([key, config]) => (
          <DropdownMenuItem
            key={key}
            onSelect={() => handleSelect(key)}
            disabled={disabled || key === currentStatus}
            className="flex items-center gap-2"
          >
            {key === currentStatus && <Check className="h-4 w-4" />}
            {config.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};