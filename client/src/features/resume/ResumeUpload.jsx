import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, X, CheckCircle2, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import Button from '../../components/Button';
import Badge from '../../components/ui/Badge';
import resumeService from './resumeService';
import { formatFileSize } from '../../utils/helpers';
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE } from '../../utils/constants';

export default function ResumeUpload({ onUploadComplete }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
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
    setUploadProgress(0);

    try {
      const data = await resumeService.uploadResume(file, (percent) => {
        setUploadProgress(percent);
      });
      setResult(data);
      if (onUploadComplete) onUploadComplete(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyze resume. Please try again.');
      setResult(null);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setUploadProgress(0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl lg:text-3xl font-bold text-text-main font-display">Resume Analysis</h1>
        <p className="text-text-muted mt-1">Upload your resume and let AI extract your skills and insights</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <h2 className="text-lg font-semibold text-text-main font-display mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            Upload Resume
          </h2>

          {!result ? (
            <>
              <div
                {...getRootProps()}
                className={`
                  relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300
                  ${isDragActive
                    ? 'border-primary bg-primary-muted'
                    : 'border-border hover:border-primary/50 hover:bg-surface-50'
                  }
                `}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${
                    isDragActive ? 'bg-primary-muted' : 'bg-surface-100'
                  }`}>
                    <Upload className={`w-8 h-8 ${isDragActive ? 'text-primary' : 'text-text-subtle'}`} />
                  </div>
                  <div>
                    <p className="text-text-main font-medium">
                      {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume'}
                    </p>
                    <p className="text-sm text-text-subtle mt-1">or click to browse • PDF, DOCX up to 10MB</p>
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
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 border border-border">
                      <FileText className="w-8 h-8 text-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-main truncate">{file.name}</p>
                        <p className="text-xs text-text-subtle">{formatFileSize(file.size)}</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); setFile(null); }}
                        className="p-1.5 rounded-lg hover:bg-surface-100 text-text-subtle hover:text-text-main transition-all cursor-pointer"
                        aria-label="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Upload Progress Bar */}
                    {uploading && uploadProgress > 0 && (
                      <div className="mt-3 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-text-muted">Uploading...</span>
                          <span className="text-xs font-mono text-primary">{uploadProgress}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-surface-100 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${uploadProgress}%` }}
                            className="h-full rounded-full bg-gradient-to-r from-primary to-ai-accent transition-all"
                          />
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={handleUpload}
                      loading={uploading}
                      className="w-full mt-4"
                      icon={Sparkles}
                      variant="ai"
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
                  className="mt-4 p-3 rounded-xl bg-error-muted border border-error/20 flex items-center gap-2 text-error text-sm"
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
              <div className="w-16 h-16 rounded-2xl bg-success-muted flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-lg font-semibold text-text-main font-display">Analysis Complete!</h3>
              <p className="text-sm text-text-muted mt-1">
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
          <h2 className="text-lg font-semibold text-text-main font-display mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-ai-accent" />
            AI Analysis Results
          </h2>

          {uploading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
              <p className="text-sm text-text-muted">Analyzing your resume with AI...</p>
              <p className="text-xs text-text-subtle mt-1">This may take a few moments</p>
            </div>
          ) : result ? (
            <div className="space-y-6">
              {/* Summary */}
              {result.summary && (
                <div className="p-4 rounded-xl bg-primary-muted border border-primary/20">
                  <p className="text-sm text-text-main">{result.summary}</p>
                </div>
              )}

              {/* Info chips */}
              <div className="flex flex-wrap gap-2">
                {result.experience && (
                  <Badge variant="primary">📅 {result.experience}</Badge>
                )}
                {result.education && (
                  <Badge variant="success">🎓 {result.education}</Badge>
                )}
              </div>

              {/* Skills list */}
              <div>
                <h4 className="text-sm font-medium text-text-main font-display mb-3">Extracted Skills</h4>
                <div className="space-y-3">
                  {Array.isArray(result.skills) && result.skills.map((skill, i) => (
                    <motion.div
                      key={skill.name || `${skill}-${i}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-text-main">{skill.name || String(skill)}</span>
                          {skill.category && (
                            <Badge variant="default" size="sm">{skill.category}</Badge>
                          )}
                        </div>
                        <span className="text-xs font-mono text-text-subtle">{skill.proficiency || 0}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-surface-100 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${skill.proficiency || 0}%` }}
                          transition={{ duration: 0.8, delay: 0.2 + i * 0.05 }}
                          className="h-full rounded-full bg-gradient-to-r from-primary to-ai-accent"
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileText className="w-12 h-12 text-text-subtle mb-4" />
              <p className="text-sm text-text-muted">Upload a resume to see AI-powered analysis</p>
              <p className="text-xs text-text-subtle mt-1">Skills, experience, and insights will appear here</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
