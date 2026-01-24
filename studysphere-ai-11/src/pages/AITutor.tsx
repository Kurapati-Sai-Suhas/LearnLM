import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Trophy, Target, Award, TrendingUp, Users, Zap, Star } from "lucide-react";

export default function AITutor() {
  const [showAchievementsDialog, setShowAchievementsDialog] = useState(false);
  
  // Mock data - will be fetched from Django API
  const userStats = {
    totalPoints: 3450,
    level: 12,
    rank: "Gold Scholar",
    nextLevelPoints: 500,
    currentStreak: 7,
  };

  const achievements = [
    { id: 1, title: "Week Warrior", description: "7 day study streak", icon: Target, earned: true },
    { id: 2, title: "Quiz Master", description: "Completed 50 quizzes", icon: Award, earned: true },
    { id: 3, title: "Helper Hero", description: "Helped 10 peers", icon: Users, earned: true },
    { id: 4, title: "Lightning Learner", description: "Study for 100 hours", icon: Zap, earned: false },
  ];

  const peerTutors = [
    { 
      id: 1, 
      name: "Sarah Johnson", 
      expertise: "Advanced Calculus", 
      rating: 4.9, 
      sessions: 24,
      available: true 
    },
    { 
      id: 2, 
      name: "Mike Chen", 
      expertise: "Quantum Physics", 
      rating: 4.8, 
      sessions: 18,
      available: true 
    },
    { 
      id: 3, 
      name: "Emily Davis", 
      expertise: "Organic Chemistry", 
      rating: 5.0, 
      sessions: 31,
      available: false 
    },
  ];

  const challenges = [
    {
      id: 1,
      title: "Master 5 New Concepts",
      description: "Complete lessons and quizzes on 5 different topics",
      reward: "250 points",
      progress: 60,
      daysLeft: 3,
    },
    {
      id: 2,
      title: "Help 3 Peers",
      description: "Answer questions and help fellow students",
      reward: "150 points + Helper Badge",
      progress: 33,
      daysLeft: 5,
    },
    {
      id: 3,
      title: "Perfect Week",
      description: "Study for at least 30 minutes every day this week",
      reward: "300 points",
      progress: 71,
      daysLeft: 2,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">AI Tutor & Gamification</h1>
        <p className="text-muted-foreground mt-1">Track progress, earn rewards, and connect with peer tutors</p>
      </div>

      {/* User Stats Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-gradient-primary">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/80">Total Points</p>
                <p className="text-3xl font-bold text-white">{userStats.totalPoints}</p>
              </div>
              <Trophy className="h-10 w-10 text-white/80" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Level</p>
                <p className="text-3xl font-bold text-foreground">{userStats.level}</p>
              </div>
              <TrendingUp className="h-10 w-10 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rank</p>
                <p className="text-xl font-bold text-foreground">{userStats.rank}</p>
              </div>
              <Award className="h-10 w-10 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Streak</p>
                <p className="text-3xl font-bold text-foreground">{userStats.currentStreak}</p>
              </div>
              <Zap className="h-10 w-10 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      <Card className="border-border">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">Level {userStats.level}</h3>
                <p className="text-sm text-muted-foreground">{userStats.nextLevelPoints} points to next level</p>
              </div>
              <Badge className="bg-primary text-primary-foreground">
                {Math.round((userStats.nextLevelPoints / (userStats.nextLevelPoints + 500)) * 100)}%
              </Badge>
            </div>
            <Progress value={75} className="h-3" />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Active Challenges */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Active Challenges</h2>
          </div>
          <div className="space-y-4">
            {challenges.map((challenge) => (
              <Card key={challenge.id} className="border-border hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-foreground">{challenge.title}</CardTitle>
                      <CardDescription>{challenge.description}</CardDescription>
                    </div>
                    <Badge variant="secondary" className="bg-success/10 text-success">
                      {challenge.daysLeft}d left
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold text-foreground">{challenge.progress}%</span>
                    </div>
                    <Progress value={challenge.progress} className="h-2" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-primary">Reward: {challenge.reward}</span>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                      onClick={() => setShowAchievementsDialog(true)}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Achievements & Peer Tutors */}
        <div className="space-y-6">
          {/* Achievements */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Achievements</h2>
            </div>
            <div className="grid gap-3 grid-cols-2">
              {achievements.map((achievement) => (
                <Card 
                  key={achievement.id} 
                  className={`border-border transition-all ${
                    achievement.earned 
                      ? "bg-primary/5 border-primary/50" 
                      : "opacity-60"
                  }`}
                >
                  <CardContent className="pt-6 text-center">
                    <div className={`h-12 w-12 rounded-full mx-auto mb-3 flex items-center justify-center ${
                      achievement.earned ? "bg-primary/10" : "bg-muted"
                    }`}>
                      <achievement.icon className={`h-6 w-6 ${
                        achievement.earned ? "text-primary" : "text-muted-foreground"
                      }`} />
                    </div>
                    <h4 className="font-semibold text-sm text-foreground mb-1">
                      {achievement.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Peer Tutors */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Recommended Peer Tutors</h2>
            </div>
            <div className="space-y-3">
              {peerTutors.map((tutor) => (
                <Card key={tutor.id} className="border-border hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-foreground">{tutor.name}</h4>
                          {tutor.available && (
                            <Badge className="bg-success text-success-foreground text-xs">Available</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{tutor.expertise}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-warning text-warning" />
                            <span>{tutor.rating}</span>
                          </div>
                          <span>{tutor.sessions} sessions</span>
                        </div>
                      </div>
                      <Button 
                        size="sm"
                        disabled={!tutor.available}
                        className="bg-primary hover:bg-primary-dark text-primary-foreground"
                      >
                        Request Session
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Achievements Dialog */}
      <Dialog open={showAchievementsDialog} onOpenChange={setShowAchievementsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              My Achievements
            </DialogTitle>
            <DialogDescription>
              Track your progress and unlock new achievements as you learn
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {achievements.map((achievement) => (
              <Card 
                key={achievement.id} 
                className={`border-border transition-all ${
                  achievement.earned 
                    ? "bg-primary/5 border-primary/50" 
                    : "opacity-60"
                }`}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className={`h-16 w-16 rounded-full flex items-center justify-center flex-shrink-0 ${
                      achievement.earned ? "bg-primary/10" : "bg-muted"
                    }`}>
                      <achievement.icon className={`h-8 w-8 ${
                        achievement.earned ? "text-primary" : "text-muted-foreground"
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-foreground">
                          {achievement.title}
                        </h4>
                        {achievement.earned && (
                          <Badge className="bg-success text-success-foreground text-xs">Earned</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>
                      {achievement.earned ? (
                        <p className="text-xs text-success font-medium">Unlocked!</p>
                      ) : (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">0%</span>
                          </div>
                          <Progress value={0} className="h-1.5" />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
