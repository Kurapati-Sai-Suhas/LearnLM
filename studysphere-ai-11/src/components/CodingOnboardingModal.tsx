import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Brain, Zap } from "lucide-react";

interface ModalProps {
    groupId: string;
    groupTopic: string;
    onClose: () => void;
}

export default function CodingOnboardingModal({ groupId, groupTopic, onClose }: ModalProps) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    
    // Standard topics a user might already know
    const availableTopics = ["Array", "String", "Hash Table", "Two Pointers", "Sorting"];
    const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

    const handleToggle = (topic: string) => {
        setSelectedTopics(prev => 
            prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
        );
    };

    const handleEnterPortal = async () => {
        setLoading(true);
        const token = localStorage.getItem('authToken') || localStorage.getItem('access');

        try {
            // 1. Tell Django to update the GNN Tensor State for known topics
            if (selectedTopics.length > 0) {
                await fetch('http://localhost:8000/api/code/onboard/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ known_topics: selectedTopics })
                });
            }

            // 2. Teleport the user into the Adaptive Portal!
            navigate(`/coding-portal?topic=${groupTopic}&group=${groupId}`);
            
        } catch (error) {
            console.error("Onboarding failed", error);
        } finally {
            setLoading(false);
            onClose();
        }
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md dark:bg-slate-900 border-slate-800">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl text-white">
                        <Brain className="text-blue-500 h-6 w-6" /> 
                        AI Calibration
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Select the topics you have already mastered. Our PyTorch engine will skip these to find your optimal starting point.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                    {availableTopics.map(topic => (
                        <div key={topic} className="flex items-center space-x-3 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                            <Checkbox 
                                id={topic} 
                                checked={selectedTopics.includes(topic)}
                                onCheckedChange={() => handleToggle(topic)}
                                className="border-slate-500 data-[state=checked]:bg-blue-600"
                            />
                            <label htmlFor={topic} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-200 cursor-pointer">
                                {topic}
                            </label>
                        </div>
                    ))}
                </div>

                <DialogFooter className="sm:justify-between items-center">
                    <Button variant="ghost" onClick={onClose} className="text-slate-400 hover:text-white">
                        Cancel
                    </Button>
                    <Button onClick={handleEnterPortal} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6">
                        {loading ? "Calibrating..." : <><Zap className="w-4 h-4 mr-2" /> Launch Portal</>}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}