import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, PlayCircle, FileText, List, ChevronRight } from 'lucide-react';
import { TrainingModule as TrainingModuleType, TrainingSection } from '@/data/trainingManual';
import { useLanguage } from '@/contexts/LanguageContext';
import { trainingTranslations } from '@/data/trainingTranslations';

interface TrainingModuleProps {
  module: TrainingModuleType;
  onComplete: (moduleId: string) => void;
  isCompleted: boolean;
}

export const TrainingModule: React.FC<TrainingModuleProps> = ({ module, onComplete, isCompleted }) => {
  const { t, language } = useLanguage();
  const [currentSection, setCurrentSection] = useState(0);
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const [isExpanded, setIsExpanded] = useState(false);

  const getSectionIcon = (type: TrainingSection['type']) => {
    switch (type) {
      case 'video': return <PlayCircle className="w-4 h-4" />;
      case 'checklist': return <List className="w-4 h-4" />;
      case 'procedure': return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const handleSectionComplete = (sectionId: string) => {
    const newCompleted = new Set(completedSections);
    newCompleted.add(sectionId);
    setCompletedSections(newCompleted);
    
    if (newCompleted.size === module.sections.length) {
      onComplete(module.id);
    }
  };

  const progress = (completedSections.size / module.sections.length) * 100;

  // Get translated content
  const getTranslatedModule = () => {
    const translations = trainingTranslations[language as keyof typeof trainingTranslations];
    return translations?.modules?.[module.id] || {
      title: module.title,
      description: module.description
    };
  };

  const getTranslatedSection = (section: TrainingSection) => {
    const translations = trainingTranslations[language as keyof typeof trainingTranslations];
    const moduleTranslations = translations?.modules?.[module.id];
    const sectionTranslations = moduleTranslations?.sections?.[section.id];
    
    return {
      title: sectionTranslations?.title || section.title,
      content: sectionTranslations?.content || section.content,
      keyPoints: sectionTranslations?.keyPoints || section.keyPoints
    };
  };

  const translatedModule = getTranslatedModule();

  if (!isExpanded) {
    return (
      <Card className="bg-white hover:shadow-md transition-shadow cursor-pointer" onClick={() => setIsExpanded(true)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold text-lg">{translatedModule.title}</h3>
                {isCompleted && <CheckCircle className="w-5 h-5 text-green-600" />}
              </div>
              <p className="text-gray-600 mb-3">{translatedModule.description}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {module.duration}
                </div>
                <div>{module.sections.length} sections</div>
              </div>
              {progress > 0 && (
                <div className="mt-3">
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">{Math.round(progress)}% complete</p>
                </div>
              )}
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentSectionData = module.sections[currentSection];
  const translatedSection = getTranslatedSection(currentSectionData);

  return (
    <Card className="bg-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {translatedModule.title}
              {isCompleted && <CheckCircle className="w-5 h-5 text-green-600" />}
            </CardTitle>
            <p className="text-gray-600 mt-1">{translatedModule.description}</p>
          </div>
          <Button variant="outline" onClick={() => setIsExpanded(false)}>
            Minimize
          </Button>
        </div>
        <Progress value={progress} className="h-2" />
        <p className="text-sm text-gray-500">{completedSections.size} of {module.sections.length} sections completed</p>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-700 mb-3">SECTIONS</h4>
            {module.sections.map((section, index) => {
              const translatedSectionTitle = getTranslatedSection(section).title;
              return (
                <button
                  key={section.id}
                  onClick={() => setCurrentSection(index)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    currentSection === index
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {getSectionIcon(section.type)}
                    <span className="text-sm font-medium">{translatedSectionTitle}</span>
                    {completedSections.has(section.id) && (
                      <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="md:col-span-2">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                {getSectionIcon(currentSectionData.type)}
                <h3 className="font-semibold text-lg">{translatedSection.title}</h3>
                <Badge variant="outline">{currentSectionData.type}</Badge>
              </div>
              <p className="text-gray-600 mb-4">{translatedSection.content}</p>
            </div>

            {translatedSection.keyPoints && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Key Points:</h4>
                <ul className="space-y-2">
                  {translatedSection.keyPoints.map((point, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
                disabled={currentSection === 0}
              >
                {t('common.previous')}
              </Button>
              <div className="flex gap-2">
                {!completedSections.has(currentSectionData.id) && (
                  <Button
                    onClick={() => handleSectionComplete(currentSectionData.id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Mark Complete
                  </Button>
                )}
                <Button
                  onClick={() => setCurrentSection(Math.min(module.sections.length - 1, currentSection + 1))}
                  disabled={currentSection === module.sections.length - 1}
                >
                  {t('common.next')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrainingModule;