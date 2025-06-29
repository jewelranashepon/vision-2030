"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface TopMember {
  membershipId: string;
  totalPaid: number;
  paymentCount: number;
  user: {
    name: string;
  };
}

export function TopMembers() {
  const [topMembers, setTopMembers] = useState<TopMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTopMembers();
  }, []);

  const fetchTopMembers = async () => {
    try {
      const response = await fetch('/api/admin/top-members');
      const data = await response.json();
      setTopMembers(data);
    } catch (error) {
      console.error('Failed to fetch top members:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Contributing Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="p-4 border rounded-lg animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Contributing Members</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topMembers.map((member, index) => (
            <div key={member.membershipId} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback>
                    {member.user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {member.user.name}
                    </p>
                    {index < 3 && (
                      <Badge variant={index === 0 ? "default" : "secondary"}>
                        #{index + 1}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {member.membershipId}
                  </p>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm font-semibold text-green-600">
                      ₹{member.totalPaid.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {member.paymentCount} payments
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}