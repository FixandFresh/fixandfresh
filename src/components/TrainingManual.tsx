import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Award, Clock, CheckCircle, Star, Target } from 'lucide-react';
import { trainingModules, serviceStandards } from '@/data/trainingManual';
import TrainingModule from './TrainingModule';
import { useLanguage } from '@/contexts/LanguageContext';
import { trainingTranslations } from '@/data/trainingTranslations';

interface TrainingManualProps {
  providerId: string;
}

const TrainingManual: React.FC<TrainingManualProps> = ({ providerId }) => {
  const { t, language } = useLanguage();
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState('overview');

  const handleModuleComplete = (moduleId: string) => {
    const newCompleted = new Set(completedModules);
    newCompleted.add(moduleId);
    setCompletedModules(newCompleted);
  };

  const completionPercentage = (completedModules.size / trainingModules.length) * 100;

  // Get translated training modules with fallback to original
  const getTranslatedModules = () => {
    const translations = trainingTranslations[language as keyof typeof trainingTranslations];
    return trainingModules.map(module => {
      const translatedModule = translations?.modules?.[module.id];
      return {
        ...module,
        title: translatedModule?.title || module.title,
        description: translatedModule?.description || module.description
      };
    });
  };

  const translatedModules = getTranslatedModules();

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">{t('app.title')} Training Manual</h1>
          <Badge className="bg-blue-100 text-blue-800">Provider Only</Badge>
        </div>
        <p className="text-gray-600 text-lg">Master the {t('app.title')} standard of service excellence</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="training">Training Modules</TabsTrigger>
          <TabsTrigger value="standards">Service Standards</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  Training Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Completion Rate</span>
                    <span className="text-2xl font-bold text-blue-600">{Math.round(completionPercentage)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{completedModules.size} of {trainingModules.length} modules completed</span>
                    {completionPercentage === 100 && (
                      <Badge className="bg-green-100 text-green-800">
                        <Award className="w-3 h-3 mr-1" />
                        Certified
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-600" />
                  Why This Training Matters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Deliver consistent, premium service experiences</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Increase customer satisfaction and repeat business</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Maximize earning potential through quality ratings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Stay ahead of industry best practices</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-3 text-blue-900">The {t('app.title')} Advantage</h3>
              <p className="text-blue-800 mb-4">
                Our training program incorporates the latest industry research, customer experience best practices, 
                and cutting-edge service delivery techniques to ensure {t('app.title')} providers deliver exceptional results.
              </p>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white p-3 rounded-lg">
                  <div className="font-medium text-blue-900">Research-Based</div>
                  <div className="text-blue-700">Built on 2024 industry studies</div>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <div className="font-medium text-blue-900">Customer-Centric</div>
                  <div className="text-blue-700">Focused on satisfaction metrics</div>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <div className="font-medium text-blue-900">Competitive Edge</div>
                  <div className="text-blue-700">Advanced techniques & tools</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training" className="space-y-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Training Modules</h2>
            <p className="text-gray-600">Complete all modules to become a certified {t('app.title')} provider</p>
          </div>
          
          <div className="space-y-4">
            {trainingModules.map((module) => (
              <TrainingModule
                key={module.id}
                module={module}
                onComplete={handleModuleComplete}
                isCompleted={completedModules.has(module.id)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="standards" className="space-y-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Service Standards</h2>
            <p className="text-gray-600">Key performance indicators and quality benchmarks</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Response Time</span>
                    <Badge className="bg-blue-100 text-blue-800">{serviceStandards.responseTime}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Arrival Window</span>
                    <Badge className="bg-green-100 text-green-800">{serviceStandards.arrivalWindow}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Quality Score</span>
                    <Badge className="bg-yellow-100 text-yellow-800">{serviceStandards.qualityScore}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Completion Rate</span>
                    <Badge className="bg-purple-100 text-purple-800">{serviceStandards.completionRate}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Customer Satisfaction</span>
                    <Badge className="bg-green-100 text-green-800">{serviceStandards.customerSatisfaction}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Quality Assurance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-sm">Pre-Service Inspection</div>
                      <div className="text-xs text-gray-600">Document conditions and assess requirements</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-sm">Progress Monitoring</div>
                      <div className="text-xs text-gray-600">Regular quality checks during service</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-sm">Final Walkthrough</div>
                      <div className="text-xs text-gray-600">Client approval and satisfaction confirmation</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-sm">Follow-up Protocol</div>
                      <div className="text-xs text-gray-600">24-hour satisfaction check and feedback</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TrainingManual;