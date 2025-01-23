import React, { useState } from 'react';
import { FileText, Calendar, Download, Mail, BarChart2, Table, Activity, Filter } from 'lucide-react';
import type { CustomReport, TeamMember } from '../types';

interface ReportGeneratorProps {
  reports: CustomReport[];
  teamMembers: TeamMember[];
  onCreateReport: (report: Omit<CustomReport, 'id'>) => void;
  onScheduleReport: (reportId: string, schedule: CustomReport['schedule']) => void;
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  reports,
  teamMembers,
  onCreateReport,
  onScheduleReport
}) => {
  const [activeReport, setActiveReport] = useState<CustomReport | null>(null);
  const [showNewReportForm, setShowNewReportForm] = useState(false);

  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault();
    // Logique de création de rapport
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-8 h-8" />
          <div>
            <h2 className="text-2xl font-bold">Générateur de Rapports</h2>
            <p className="text-green-100">Créez et programmez des rapports personnalisés</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5" />
              <span>Rapports Créés</span>
            </div>
            <div className="text-2xl font-bold">{reports.length}</div>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5" />
              <span>Rapports Programmés</span>
            </div>
            <div className="text-2xl font-bold">
              {reports.filter(r => r.schedule).length}
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Download className="w-5 h-5" />
              <span>Téléchargements</span>
            </div>
            <div className="text-2xl font-bold">24</div>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-5 h-5" />
              <span>Envois par Email</span>
            </div>
            <div className="text-2xl font-bold">12</div>
          </div>
        </div>
      </div>

      {/* Liste des rapports */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Rapports Personnalisés</h3>
          <button
            onClick={() => setShowNewReportForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <FileText className="w-4 h-4" />
            Nouveau Rapport
          </button>
        </div>

        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100"
              onClick={() => setActiveReport(report)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{report.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                  
                  <div className="flex items-center gap-4 mt-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      report.type === 'performance' ? 'bg-blue-100 text-blue-800' :
                      report.type === 'wellbeing' ? 'bg-green-100 text-green-800' :
                      report.type === 'goals' ? 'bg-purple-100 text-purple-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {report.type}
                    </span>

                    {report.schedule && (
                      <span className="flex items-center gap-1 text-xs text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {report.schedule.frequency}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-600 hover:text-blue-600 rounded-lg">
                    <Download className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-blue-600 rounded-lg">
                    <Mail className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {report.visualizations.map((viz, index) => (
                  <span
                    key={index}
                    className="flex items-center gap-1 px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-xs"
                  >
                    {viz.type === 'chart' ? <BarChart2 className="w-3 h-3" /> :
                     viz.type === 'table' ? <Table className="w-3 h-3" /> :
                     <Activity className="w-3 h-3" />}
                    {viz.type}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Formulaire de création de rapport */}
      {showNewReportForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Créer un Nouveau Rapport</h3>
            </div>

            <form onSubmit={handleCreateReport} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du rapport
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Nom du rapport"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                  placeholder="Description du rapport"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de rapport
                </label>
                <select className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                  <option value="performance">Performance</option>
                  <option value="wellbeing">Bien-être</option>
                  <option value="goals">Objectifs</option>
                  <option value="feedback">Feedback</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filtres
                </label>
                <div className="space-y-2">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-600">Date de début</label>
                      <input
                        type="date"
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-600">Date de fin</label>
                      <input
                        type="date"
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600">Équipes</label>
                    <select
                      multiple
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="team1">Équipe 1</option>
                      <option value="team2">Équipe 2</option>
                      <option value="team3">Équipe 3</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Visualisations
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="chart" className="rounded border-gray-300" />
                    <label htmlFor="chart" className="text-sm text-gray-700">Graphiques</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="table" className="rounded border-gray-300" />
                    <label htmlFor="table" className="text-sm text-gray-700">Tableaux</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="kpi" className="rounded border-gray-300" />
                    <label htmlFor="kpi" className="text-sm text-gray-700">KPIs</label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Programmation
                </label>
                <div className="space-y-2">
                  <select className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                    <option value="">Pas de programmation</option>
                    <option value="daily">Quotidien</option>
                    <option value="weekly">Hebdomadaire</option>
                    <option value="monthly">Mensuel</option>
                  </select>

                  <input
                    type="email"
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Adresses email (séparées par des virgules)"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowNewReportForm(false)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Créer le rapport
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportGenerator;