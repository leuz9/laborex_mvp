import React, { useState } from 'react';
import { FileText, Image, Folder, Download, Share2, Clock, Plus, X, MessageSquare, Send } from 'lucide-react';

interface File {
  id: string;
  name: string;
  type: 'document' | 'image' | 'folder';
  size?: string;
  lastModified: string;
  sharedWith: string[];
  preview?: string;
  comments?: Comment[];
}

interface Comment {
  id: string;
  user: string;
  avatar: string;
  text: string;
  timestamp: string;
}

const TeamWorkspace: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newComment, setNewComment] = useState('');

  const files: File[] = [
    {
      id: '1',
      name: 'Project Requirements.doc',
      type: 'document',
      size: '2.4 MB',
      lastModified: '2024-03-15',
      sharedWith: ['Sarah Johnson', 'Michael Chen'],
      preview: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=800',
      comments: [
        {
          id: '1',
          user: 'Sarah Johnson',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
          text: 'Please review the updated requirements for the homepage.',
          timestamp: '2024-03-15T10:30:00'
        }
      ]
    },
    {
      id: '2',
      name: 'Design Assets',
      type: 'folder',
      lastModified: '2024-03-14',
      sharedWith: ['Emma Wilson', 'Sarah Johnson']
    },
    {
      id: '3',
      name: 'Homepage Mockup.png',
      type: 'image',
      size: '4.8 MB',
      lastModified: '2024-03-13',
      sharedWith: ['Emma Wilson'],
      preview: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=800',
      comments: [
        {
          id: '2',
          user: 'Emma Wilson',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
          text: 'Latest version of the homepage design.',
          timestamp: '2024-03-13T15:45:00'
        }
      ]
    }
  ];

  const getFileIcon = (type: File['type']) => {
    switch (type) {
      case 'document':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'image':
        return <Image className="w-5 h-5 text-green-600" />;
      case 'folder':
        return <Folder className="w-5 h-5 text-yellow-600" />;
    }
  };

  const handleFileClick = (file: File) => {
    setSelectedFile(file);
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !selectedFile) return;

    const comment: Comment = {
      id: Date.now().toString(),
      user: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      text: newComment,
      timestamp: new Date().toISOString()
    };

    selectedFile.comments = [...(selectedFile.comments || []), comment];
    setNewComment('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Team Workspace</h2>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            Upload Files
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Name</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Size</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Last Modified</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Shared With</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr 
                  key={file.id} 
                  className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleFileClick(file)}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {getFileIcon(file.type)}
                      <span className="text-sm text-gray-900">{file.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-600">{file.size || '-'}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {new Date(file.lastModified).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex -space-x-2">
                      {file.sharedWith.map((user, index) => (
                        <div
                          key={index}
                          className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center"
                          title={user}
                        >
                          <span className="text-xs font-medium">{user.charAt(0)}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button 
                        className="p-1 hover:bg-gray-100 rounded" 
                        title="Download"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Download className="w-4 h-4 text-gray-600" />
                      </button>
                      <button 
                        className="p-1 hover:bg-gray-100 rounded" 
                        title="Share"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Share2 className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">{selectedFile.name}</h3>
              <button 
                onClick={() => setSelectedFile(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 divide-x divide-gray-200 h-[calc(90vh-4rem)]">
              <div className="p-4 overflow-auto">
                {selectedFile.preview ? (
                  <img 
                    src={selectedFile.preview} 
                    alt={selectedFile.name}
                    className="w-full h-auto rounded-lg"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No preview available
                  </div>
                )}
              </div>
              <div className="flex flex-col h-full">
                <div className="p-4 border-b border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">Comments</h4>
                  <div className="space-y-4 max-h-[calc(90vh-16rem)] overflow-auto">
                    {selectedFile.comments?.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <img 
                          src={comment.avatar} 
                          alt={comment.user}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className="font-medium text-sm">{comment.user}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(comment.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mt-1">{comment.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-4 mt-auto">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      onClick={handleAddComment}
                      className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamWorkspace;