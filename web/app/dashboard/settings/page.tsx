"use client";
import { useState } from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import Head from "next/head";

export default function SettingsPage() {
    const [frequency, setFrequency] = useState(24);
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // TODO: Replace with your API call
        setTimeout(() => {
            setSuccess("Settings saved successfully!");
            setLoading(false);
            setTimeout(() => setSuccess(""), 2000);
        }, 1000);
    };

    return (
        <>
            <Head>
                <title>Settings | BullBearMail</title>
                <meta name="description" content="Manage your settings in BullBearMail." />
            </Head>
            <div className="flex h-full w-full items-center justify-center bg-background">
                <Card className="w-full max-w-md h-auto max-h-screen shadow-lg">
                    <CardHeader>
                        <h2 className="text-xl font-bold">Settings</h2>
                    </CardHeader>
                    <Separator />
                    <form onSubmit={handleSave}>
                        <CardContent>
                            <div className="space-y-6">
                                {success && (
                                    <div className="text-green-500 text-center font-medium">
                                        {success}
                                    </div>
                                )}
                                <div>
                                    <label htmlFor="frequency" className="block text-sm font-medium mb-1">
                                        Send Frequency
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <Slider
                                            id="frequency"
                                            min={1}
                                            max={24}
                                            step={1}
                                            value={[frequency]}
                                            onValueChange={(val) => setFrequency(val[0])}
                                            className="w-2/3"
                                        />
                                        <span className="font-semibold">{frequency}h</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-2">
                                        Adjust how often you receive emails (hours)
                                    </div>
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={loading}
                                >
                                    {loading ? "Saving..." : "Save Settings"}
                                </Button>
                            </div>
                        </CardContent>
                    </form>
                    <CardFooter>
                        <span className="text-sm text-gray-500">
                            More settings coming soon...
                        </span>
                    </CardFooter>
                </Card>
            </div>
        </>

    );
}