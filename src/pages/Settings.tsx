
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Settings = () => {
  const { currentUser, signOut } = useAuth();

  const getInitials = (name: string) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your preferences</p>
      </div>

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account" className="space-y-4">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Manage your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={currentUser?.photoURL || undefined} alt={currentUser?.displayName || "User"} />
                  <AvatarFallback className="text-lg">
                    {getInitials(currentUser?.displayName || "User")}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <h3 className="text-lg font-medium">{currentUser?.displayName}</h3>
                  <p className="text-sm text-muted-foreground">{currentUser?.email}</p>
                </div>
              </div>

              <div className="pt-4">
                <Button variant="destructive" onClick={signOut}>
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance" className="space-y-4">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the look and feel</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Appearance settings will be available in a future update.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Manage your notification preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Notification settings will be available in a future update.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="about" className="space-y-4">
          <Card className="glass">
            <CardHeader>
              <CardTitle>About TaskVista</CardTitle>
              <CardDescription>Information about this application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">TaskVista</h3>
                <p className="text-sm text-muted-foreground">Version 1.0.0</p>
              </div>
              
              <p>A beautifully designed task management application built with React and Firebase.</p>
              
              <div>
                <h4 className="font-medium">Features:</h4>
                <ul className="ml-6 list-disc text-sm text-muted-foreground">
                  <li>Task management with drag-and-drop</li>
                  <li>Task categorization and tagging</li>
                  <li>Due dates and priority levels</li>
                  <li>Calendar integration</li>
                  <li>Task history and activity logging</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
