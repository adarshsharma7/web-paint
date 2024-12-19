'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

import Cookies from 'js-cookie';
import axios from 'axios';
import { useRouter } from 'next/navigation';


const signInValidation = z.object({
  identifier: z.string().min(1, 'Email/Username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function SignInForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forgetPassLoading, setForgetPassLoading] = useState(false);
  
  const form = useForm({
    resolver: zodResolver(signInValidation),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });
  
  const router=useRouter();
  const { toast } = useToast();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
     
      
      const response = await axios.post("/api/users/sign-in", {
        identifier: data.identifier,
        password: data.password,
      });
  
      if (response.data.success === false) {
        // Handle the verification case
        if (response.data.username) {
          toast({
            title: 'Code Sent',
            description: 'Check your email for the verification code.',
          });
          
          router.replace(`/verify/${response.data.username}`);
          
        } else {
          // Handle other error messages
          toast({
            title: 'Error',
            description: response.data.message,
          });
        }
        setIsSubmitting(false);
        return;
      }
  
      // If successful, set the token in a cookie
      if (response.data.success) {
        Cookies.set('token', response.data.token, { expires: 1 }); // Expires in 1 day
  
        setTimeout(() => {
          setIsSubmitting(false);
          toast({
            title: 'Success',
            description: 'Logged in successfully!',
          });
          router.replace('/'); // Redirect to the home page
        }, 1000);
      }
    } catch (error) {
      // Handle unexpected errors
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const forgetPassword = async () => {
    try {
      setForgetPassLoading(true);
      const response = await axios.post('api/users/forgetPassword', { credential: form.getValues("identifier") })
      if (response.data.success) {
        toast({
          title: 'Success',
          description: response.data.message,
        });
      }

      if (response.data.message == 'Email is already sent for change password') {
        toast({
          title: 'Success',
          description: response.data.message,
        });
      }
    } catch (error) {
      console.log("something wrong", error);
    } finally {
      setForgetPassLoading(false);
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-500 to-blue-300">
      <div className="w-full max-w-sm p-8 space-y-6 bg-white border border-gray-200 rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">Sign in to Sync Draw</h1>
          <p className="text-gray-600 mb-6">Join the Sync Draw and start creating!</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              name="identifier"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-gray-700">Email/Username</FormLabel>
                  <Input
                    {...field}
                    placeholder="Enter your email or username"
                    className="border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:border-blue-500"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-gray-700">Password</FormLabel>
                  <Input
                    type="password"
                    {...field}
                    placeholder="Enter your password"
                    className="border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:border-blue-500"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-between items-center">
              {forgetPassLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-blue-600" />
              ) : (
                <button
                  className='text-blue-600 hover:underline'
                  type='button'
                  onClick={forgetPassword}
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <Button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </Form>
        <div className="text-center mt-4">
          <p className="text-gray-600">
            Not a member yet?{' '}
            <Link href="/sign-up" className="text-blue-600 hover:text-blue-800">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
