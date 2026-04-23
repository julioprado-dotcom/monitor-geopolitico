'use client';

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, FileText, Link, ChevronRight } from '@/lib/icons';
import type { InputType } from '@/lib/types';

interface InputFormProps {
  onSubmit: (inputType: InputType, content: string) => void;
  isLoading: boolean;
}

export function InputForm({ onSubmit, isLoading }: InputFormProps) {
  const [activeTab, setActiveTab] = useState<string>('text');
  const [textContent, setTextContent] = useState('');
  const [urlContent, setUrlContent] = useState('');
  const [claimContent, setClaimContent] = useState('');

  const getCurrentContent = () => {
    switch (activeTab) {
      case 'text': return textContent;
      case 'url': return urlContent;
      case 'claim': return claimContent;
      default: return '';
    }
  };

  const handleSubmit = () => {
    const content = getCurrentContent();
    if (!content.trim()) return;
    onSubmit(activeTab as InputType, content.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && activeTab !== 'text') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">
          Verifica cualquier información
        </h2>
        <p className="text-muted-foreground text-sm md:text-base">
          Ingresa una noticia, URL o afirmación y obtén un análisis crítico-pluralista con fuentes diversas
        </p>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-lg overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full rounded-none border-b bg-transparent h-auto p-0">
            <TabsTrigger
              value="text"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-neon data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 px-4 gap-2 text-sm"
            >
              <FileText className="w-4 h-4" />
              Texto completo
            </TabsTrigger>
            <TabsTrigger
              value="url"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-neon data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 px-4 gap-2 text-sm"
            >
              <Link className="w-4 h-4" />
              URL
            </TabsTrigger>
            <TabsTrigger
              value="claim"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-neon data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 px-4 gap-2 text-sm"
            >
              <Search className="w-4 h-4" />
              Afirmación
            </TabsTrigger>
          </TabsList>

          <div className="p-4 md:p-6">
            <TabsContent value="text" className="mt-0">
              <Textarea
                placeholder="Pega aquí el texto completo de la noticia que deseas verificar..."
                className="min-h-[160px] resize-none text-sm md:text-base"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
              />
            </TabsContent>

            <TabsContent value="url" className="mt-0">
              <Input
                type="url"
                placeholder="https://ejemplo.com/noticia"
                className="h-14 text-sm md:text-base"
                value={urlContent}
                onChange={(e) => setUrlContent(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Extraeremos automáticamente el contenido de la URL para su análisis
              </p>
            </TabsContent>

            <TabsContent value="claim" className="mt-0">
              <Textarea
                placeholder="Escribe la afirmación específica que deseas verificar (ej: 'Las sanciones económicas no afectan a la población civil')"
                className="min-h-[100px] resize-none text-sm md:text-base"
                value={claimContent}
                onChange={(e) => setClaimContent(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </TabsContent>
          </div>
        </Tabs>

        <div className="px-4 md:px-6 pb-4 md:pb-6">
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !getCurrentContent().trim()}
            className="w-full h-12 text-base font-semibold gap-2 bg-neon hover:bg-neon/90 text-deep"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                Verificar con enfoque Crítico-Pluralista
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
