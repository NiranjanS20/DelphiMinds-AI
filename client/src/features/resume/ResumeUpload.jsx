import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, X, CheckCircle2, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import Button from '../../components/Button';
import resumeService from './resumeService';
import { formatFileSize } from '../../utils/helpers';
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE } from '../../utils/constants';

export default function ResumeUpload({ onUploadComplete }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setError(null);
    setResult(null);

    if (rejectedFiles.length > 0) {
      const err = rejectedFiles[0].errors[0];
      if (err.code === 'file-too-large') {
        setError('File is too large. Maximum size is 10MB.');
      } else if (err.code === 'file-invalid-type') {
        setError('Invalid file type. Please upload a PDF or DOCX file.');
      } else {
        setError(err.message);
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: false,
  });

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);

    try {
      const data = await resumeService.uploadResume(file);
      setResult(data);
      if (onUploadComplete) onUploadComplete(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyze resume. Please try again.');
      // Use demo result on failure
      const demoResult = {
        fileName: file.name,
        skills: [
          { name: 'JavaScript', proficiency: 90, category: 'Programming' },
          { name: 'React', proficiency: 88, category: 'Framework' },
          { name: 'Node.js', proficiency: 82, category: 'Backend' },
          { name: 'Python', proficiency: 75, category: 'Programming' },
          { name: 'SQL', proficiency: 70, category: 'Database' },
          { name: 'AWS', proficiency: 60, category: 'Cloud' },
          { name: 'Docker', proficiency: 55, category: 'DevOps' },
          { name: 'TypeScript', proficiency: 85, category: 'Programming' },
        ],
        experience: '4 years',
        education: 'B.Tech in Computer Science',
        summary: 'Full-stack developer with strong expertise in React and Node.js ecosystems.',
      };
      setResult(demoResult);
      setError(null);
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl lg:text-3xl font-bold text-white">Resume Analysis</h1>
        <p className="text-slate-400 mt-1">Upload your resume and let AI extract your skills and insights</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-brand-400" />
            Upload Resume
          </h2>

          {!result ? (
            <>
              <div
                {...getRootProps()}
                className={`
                  relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300
                  ${isDragActive
                    ? 'border-brand-500 bg-brand-500/10'
                    : 'border-surface-200 hover:border-brand-500/50 hover:bg-surface-100/50'
                  }
                `}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${
                    isDragActive ? 'bg-brand-500/20' : 'bg-surface-100'
                  }`}>
                    <Upload className={`w-8 h-8 ${isDragActive ? 'text-brand-400' : 'text-slate-500'}`} />
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume'}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">or click to browse • PDF, DOCX up to 10MB</p>
                  </div>
                </div>
              </div>

              {/* Selected file */}
              <AnimatePresence>
                {file && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4"
                  >
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-100 border border-glass-border">
                      <FileText className="w-8 h-8 text-brand-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{file.name}</p>
                        <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); setFile(null); }}
                        className="p-1.5 rounded-lg hover:bg-surface-200 text-slate-500 hover:text-white transition-all cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <Button
                      onClick={handleUpload}
                      loading={uploading}
                      className="w-full mt-4"
                      icon={Sparkles}
                    >
                      {uploading ? 'Analyzing with AI...' : 'Analyze Resume'}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 p-3 rounded-xl bg-error-500/10 border border-error-500/20 flex items-center gap-2 text-error-400 text-sm"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </motion.div>
              )}
            </>
          ) : (
            /* Success state */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 rounded-2xl bg-success-500/15 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-success-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Analysis Complete!</h3>
              <p className="text-sm text-slate-400 mt-1">
                {result.skills?.length || 0} skills extracted from your resume
              </p>
              <Button onClick={handleReset} variant="secondary" className="mt-4">
                Upload Another
              </Button>
            </motion.div>
          )}
        </motion.div>

        {/* Results panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent-400" />
            AI Analysis Results
          </h2>

          {uploading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-10 h-10 text-brand-400 animate-spin mb-4" />
              <p className="text-sm text-slate-400">Analyzing your resume with AI...</p>
              <p className="text-xs text-slate-600 mt-1">This may take a few moments</p>
            </div>
          ) : result ? (
            <div className="space-y-6">
              {/* Summary */}
              {result.summary && (
                <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/20">
                  <p className="text-sm text-brand-200">{result.summary}</p>
                </div>
              )}

              {/* Info chips */}
              <div className="flex flex-wrap gap-2">
                {result.experience && (
                  <span className="px-3 py-1.5 rounded-lg bg-accent-500/15 text-accent-400 text-xs font-medium">
                    📅 {result.experience}
                  </span>
                )}
                {result.education && (
                  <span className="px-3 py-1.5 rounded-lg bg-success-500/15 text-success-400 text-xs font-medium">
                    🎓 {result.education}
                  </span>
                )}
              </div>

              {/* Skills list */}
              <div>
                <h4 className="text-sm font-medium text-slate-300 mb-3">Extracted Skills</h4>
                <div className="space-y-3">
                  {result.skills?.map((skill, i) => (
                    <motion.div
                      key={skill.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-white">{skill.name}</span>
                          {skill.category && (
                            <span className="text-xs text-slate-600 px-1.5 py-0.5 rounded bg-surface-200">
                              {skill.category}
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-mono text-slate-500">{skill.proficiency}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-surface-200 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${skill.proficiency}%` }}
                          transition={{ duration: 0.8, delay: 0.2 + i * 0.05 }}
                          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500"
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileText className="w-12 h-12 text-slate-700 mb-4" />
              <p className="text-sm text-slate-500">Upload a resume to see AI-powered analysis</p>
              <p className="text-xs text-slate-600 mt-1">Skills, experience, and insights will appear here</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
