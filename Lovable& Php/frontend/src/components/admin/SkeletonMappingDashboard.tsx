import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, RotateCcw, Save, Layout as LayoutIcon } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import {
  PUBLIC_ROUTES,
  SKELETON_LAYOUTS,
  loadSkeletonOverrides,
  saveSkeletonOverrides,
  type SkeletonLayoutKey,
  type SkeletonOverrides,
} from "@/config/skeletonLayouts";
import { SKELETON_LAYOUT_COMPONENTS } from "@/components/skeletons/PageSkeleton";

const SkeletonMappingDashboard: React.FC = () => {
  const [overrides, setOverrides] = useState<SkeletonOverrides>(() => loadSkeletonOverrides());
  const [previewKey, setPreviewKey] = useState<SkeletonLayoutKey | null>(null);

  const dirty = useMemo(() => {
    const stored = JSON.stringify(loadSkeletonOverrides());
    return stored !== JSON.stringify(overrides);
  }, [overrides]);

  const handleChange = (path: string, layout: SkeletonLayoutKey, isDefault: boolean) => {
    setOverrides((prev) => {
      const next = { ...prev };
      if (isDefault) delete next[path];
      else next[path] = layout;
      return next;
    });
  };

  const handleSave = () => {
    saveSkeletonOverrides(overrides);
    toast.success("Skeleton mapping saved");
  };

  const handleReset = () => {
    setOverrides({});
    saveSkeletonOverrides({});
    toast.success("Reset to defaults");
  };

  const PreviewLayout = previewKey ? SKELETON_LAYOUT_COMPONENTS[previewKey] : null;

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <CardTitle className="flex items-center gap-2">
            <LayoutIcon className="h-5 w-5 text-primary" />
            Skeleton Mapping
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Customize which skeleton layout displays during route loading for each public page.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-1.5" />
            Reset All
          </Button>
          <Button size="sm" onClick={handleSave} disabled={!dirty}>
            <Save className="h-4 w-4 mr-1.5" />
            Save Changes
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Page</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Default</TableHead>
                <TableHead>Active Skeleton</TableHead>
                <TableHead className="text-right">Preview</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {PUBLIC_ROUTES.map((route) => {
                const active = overrides[route.path] ?? route.default;
                const isOverridden = !!overrides[route.path] && overrides[route.path] !== route.default;
                return (
                  <TableRow key={route.path}>
                    <TableCell className="font-medium">{route.label}</TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-0.5 rounded">{route.path}</code>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {SKELETON_LAYOUTS.find((l) => l.key === route.default)?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Select
                          value={active}
                          onValueChange={(v) =>
                            handleChange(route.path, v as SkeletonLayoutKey, v === route.default)
                          }
                        >
                          <SelectTrigger className="w-[180px] h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SKELETON_LAYOUTS.map((layout) => (
                              <SelectItem key={layout.key} value={layout.key}>
                                <div className="flex flex-col">
                                  <span className="font-medium">{layout.label}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {layout.description}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {isOverridden && (
                          <Badge variant="secondary" className="text-xs">Custom</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setPreviewKey(active)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <Dialog open={!!previewKey} onOpenChange={(open) => !open && setPreviewKey(null)}>
          <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Preview:{" "}
                {previewKey && SKELETON_LAYOUTS.find((l) => l.key === previewKey)?.label}
              </DialogTitle>
            </DialogHeader>
            <div className="border rounded-lg overflow-hidden bg-background">
              {PreviewLayout && <PreviewLayout />}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default SkeletonMappingDashboard;
