import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Profile } from "@/types/database";

export const metadata = {
  title: "Actions",
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: Profile | null = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    profile = data as Profile | null;
  }

  const isPM = profile?.role === "pm";
  const greeting = profile?.full_name
    ? `Welcome, ${profile.full_name.split(" ")[0]}!`
    : "Welcome!";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{greeting}</h1>
          <p className="text-muted-foreground">
            {isPM
              ? "View and manage all team actions"
              : "View and manage your actions"}
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Action
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg mb-2">No actions yet</p>
            <p className="text-sm">
              Create your first action to start tracking your work
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
