"use client";

import Link from "next/link";
import { AlertCircle, CheckCircle2, Eye, PenSquare, GraduationCap, Images, TrendingUp, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/provider/authProvider";
import { useBatches, useCarouselImages, useDisplaySettings, useFaculty, useLabs, useStaffPositions } from "@/hooks/use-display-data";
import { LivePreview } from "../live-preview";
import { PageHeader } from "../page-header";
import { StatCard } from "../stat-card";

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

export function Dashboard() {
  const { username } = useAuth();
  const settings = useDisplaySettings();
  const staff = useStaffPositions();
  const faculty = useFaculty();
  const images = useCarouselImages();
  const batches = useBatches();
  const labs = useLabs();

  const loading = staff.loading || faculty.loading || images.loading || batches.loading || settings.loading;
  const error = staff.error || faculty.error || images.error || batches.error || settings.error;

  const checks = [
    { ok: staff.data.length > 0, label: "Staff counts", fix: "Placeholders are shown until you add staff roles.", href: "/admin/staff" },
    { ok: faculty.data.length > 0, label: "Faculty list", fix: "The faculty card is empty.", href: "/admin/faculty" },
    { ok: labs.data.length > 0, label: "Labs", fix: labs.error ?? "No lab pages are shown yet.", href: "/admin/labs" },
    { ok: images.data.length > 0, label: "Photo carousel", fix: "The carousel shows \"No image\".", href: "/admin/gallery" },
    { ok: batches.entries.length > 0, label: "Batch highlights", fix: "Default numbers are shown.", href: "/admin/batches" },
  ];

  return (
    <>
      <PageHeader
        title={`${greeting()}, ${username.split(" ")[0]}`}
        description="Everything you change here appears on the billboard instantly."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/admin/preview">
                <Eye /> Live preview
              </Link>
            </Button>
            <Button asChild>
              <Link href="/admin/edit">
                <PenSquare /> Edit display
              </Link>
            </Button>
          </>
        }
      />

      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium">Can&apos;t load display data</p>
            <p className="opacity-80">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Staff roles" value={staff.data.length} icon={UsersRound} href="/admin/staff" loading={loading} />
        <StatCard label="Faculty members" value={faculty.data.length} icon={GraduationCap} href="/admin/faculty" loading={loading} />
        <StatCard label="Carousel photos" value={images.data.length} icon={Images} href="/admin/gallery" loading={loading} />
        <StatCard label="Batches" value={batches.entries.length} icon={TrendingUp} href="/admin/batches" loading={loading} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid min-w-0 content-start gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Currently showing</CardTitle>
              <CardDescription>The header that appears at the top of the display.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="brand-gradient flex items-center gap-3 rounded-xl p-4 text-white sm:gap-4 sm:p-5">
                <span className="shrink-0 text-3xl font-black tracking-tighter sm:text-4xl">{settings.data.logoText || "er"}</span>
                <span className="h-10 w-px shrink-0 bg-white/40" />
                <div className="min-w-0">
                  <p className="text-xs text-white/75">{settings.data.headerText}</p>
                  <p className="line-clamp-2 text-base leading-snug sm:text-lg">{settings.data.title}</p>
                </div>
              </div>
              <Button variant="link" asChild className="mt-2 px-0">
                <Link href="/admin/general">Edit branding</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content checklist</CardTitle>
              <CardDescription>Sections of the display that still need content.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-2">
              {checks.map((check) => (
                <Link
                  key={check.label}
                  href={check.href}
                  className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/60"
                >
                  {check.ok ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
                  ) : (
                    <AlertCircle className="h-5 w-5 shrink-0 text-amber-500" />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{check.label}</p>
                    <p className="text-xs text-muted-foreground">{check.ok ? "Ready" : check.fix}</p>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit p-3">
          <LivePreview />
          <p className="px-1 pt-3 text-center text-xs text-muted-foreground">Live view of the billboard</p>
        </Card>
      </div>
    </>
  );
}
