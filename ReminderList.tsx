import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import Card, { CardHeader, CardBody } from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { Check, Clock, Bell, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatDate, isDatePast, getUrgencyClass, daysUntil } from '../../utils/helpers';

const ReminderList: React.FC = () => {
  const { reminders, leads, orders, updateReminder, deleteReminder } = useAppContext();
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('upcoming');

  const filteredReminders = reminders.filter((reminder) => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return !reminder.completed;
    if (filter === 'completed') return reminder.completed;
    return true;
  });

  const sortedReminders = [...filteredReminders].sort((a, b) => {
    if (a.completed && !b.completed) return 1;
    if (!a.completed && b.completed) return -1;
    
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateA - dateB;
  });

  const getEntityName = (reminder: typeof reminders[0]): string => {
    if (reminder.entityType === 'lead') {
      const lead = leads.find((l) => l.id === reminder.entityId);
      return lead ? lead.name : 'Unknown Lead';
    } else {
      const order = orders.find((o) => o.id === reminder.entityId);
      return order ? `Order for ${order.leadName}` : 'Unknown Order';
    }
  };

  const toggleComplete = (id: string, completed: boolean) => {
    updateReminder(id, { completed });
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Reminders</h1>
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant={filter === 'all' ? 'primary' : 'outline'}
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            size="sm"
            variant={filter === 'upcoming' ? 'primary' : 'outline'}
            onClick={() => setFilter('upcoming')}
            leftIcon={<Bell size={16} />}
          >
            Upcoming
          </Button>
          <Button
            size="sm"
            variant={filter === 'completed' ? 'primary' : 'outline'}
            onClick={() => setFilter('completed')}
            leftIcon={<CheckCircle2 size={16} />}
          >
            Completed
          </Button>
        </div>
      </div>

      {sortedReminders.length === 0 ? (
        <div className="bg-white p-8 text-center rounded-lg border border-gray-200">
          <p className="text-gray-500">No reminders found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedReminders.map((reminder) => {
            const isPast = isDatePast(reminder.date);
            const days = daysUntil(reminder.date);

            return (
              <Card key={reminder.id} className="transition-all hover:shadow">
                <CardHeader className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 mr-3">
                      <Button
                        variant={reminder.completed ? 'success' : isPast ? 'danger' : 'outline'}
                        size="sm"
                        className="p-1.5 rounded-full"
                        onClick={() => toggleComplete(reminder.id, !reminder.completed)}
                        aria-label={reminder.completed ? 'Mark as incomplete' : 'Mark as complete'}
                      >
                        {reminder.completed ? (
                          <Check size={16} />
                        ) : isPast ? (
                          <AlertCircle size={16} />
                        ) : (
                          <Clock size={16} />
                        )}
                      </Button>
                    </div>
                    <div>
                      <h3 className={`font-medium ${reminder.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                        {reminder.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        For: {getEntityName(reminder)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center sm:ml-4">
                    <Badge
                      className={
                        reminder.completed
                          ? 'bg-green-100 text-green-800'
                          : isPast
                          ? 'bg-red-100 text-red-800'
                          : days === 0
                          ? 'bg-orange-100 text-orange-800'
                          : days <= 2
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }
                    >
                      {reminder.completed
                        ? 'Completed'
                        : isPast
                        ? 'Overdue'
                        : days === 0
                        ? 'Today'
                        : `In ${days} days`}
                    </Badge>
                    <span className="text-sm text-gray-500 ml-3">
                      {formatDate(reminder.date)}
                    </span>
                  </div>
                </CardHeader>
                {reminder.description && (
                  <CardBody>
                    <p className="text-sm text-gray-600">{reminder.description}</p>
                  </CardBody>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReminderList;