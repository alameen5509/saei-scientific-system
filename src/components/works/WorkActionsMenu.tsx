"use client";

// قائمة إجراءات لكل عمل علمي — عرض، تعديل، نقل للمرحلة التالية، حذف
import { MoreHorizontal, Eye, Pencil, ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { nextStage, STAGE_LABEL, type ScientificWork } from "@/types/works";

interface Props {
  work: ScientificWork;
  onView: (w: ScientificWork) => void;
  onEdit: (w: ScientificWork) => void;
  onAdvance: (w: ScientificWork) => void;
  onDelete: (w: ScientificWork) => void;
}

export function WorkActionsMenu({
  work,
  onView,
  onEdit,
  onAdvance,
  onDelete,
}: Props) {
  const next = nextStage(work.stage);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="إجراءات"
          className="h-8 w-8"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[12rem]">
        <DropdownMenuLabel>{work.code}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => onView(work)}>
          <Eye className="h-4 w-4 text-saei-purple-500" />
          عرض التفاصيل
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onEdit(work)}>
          <Pencil className="h-4 w-4 text-saei-purple-500" />
          تعديل
        </DropdownMenuItem>
        {next && (
          <DropdownMenuItem onSelect={() => onAdvance(work)}>
            <ArrowLeft className="h-4 w-4 text-saei-teal" />
            نقل إلى: {STAGE_LABEL[next]}
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => onDelete(work)}
          className="text-red-700 focus:bg-red-50 focus:text-red-800"
        >
          <Trash2 className="h-4 w-4" />
          حذف
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
